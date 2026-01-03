/**
 * Web Notebook App Logic
 */

const App = {
    state: {
        user: null,
        tree: [],
        activeNoteId: null,
        activeNote: null,
        unsavedChanges: false,
        penWidth: 3,
        toolMode: 'pen', // 'pen', 'eraser', 'hand'
        isDrawing: false,
        lastX: 0,
        lastY: 0,
        // Canvas Dimensions
        canvasWidth: 2000,
        canvasHeight: 2000,
        // Context Menu
        contextMenuId: null
    },

    // UI Elements
    ui: {
        authScreen: document.getElementById('auth-screen'),
        mainLayout: document.getElementById('main-layout'),
        sidebar: document.getElementById('sidebar'),
        fileTree: document.getElementById('file-tree'),
        editorArea: document.getElementById('editor-area'),
        canvasWrapper: document.getElementById('canvas-wrapper'),
        canvas: document.getElementById('drawing-canvas'),
        widgetsLayer: document.getElementById('widgets-layer'),
        saveStatus: document.getElementById('save-status'),
        penSizeInput: document.getElementById('pen-size'),
        noteContainer: document.getElementById('note-container'),
        emptyState: document.getElementById('empty-state'),
        // Buttons
        btnToggleSidebar: document.getElementById('btn-toggle-sidebar'),
        btnHand: document.getElementById('tool-hand'),
        btnPen: document.getElementById('tool-pen'),
        btnEraser: document.getElementById('tool-eraser'),
        btnImage: document.getElementById('tool-image'),
        btnCode: document.getElementById('tool-code'),
        imageInput: document.getElementById('image-input'),
        // Size Inputs
        inputWidth: document.getElementById('canvas-width'),
        inputHeight: document.getElementById('canvas-height'),
        // Context Menu
        contextMenu: document.getElementById('context-menu'),
        ctxRename: document.getElementById('ctx-rename'),
        ctxDelete: document.getElementById('ctx-delete')
    },

    ctx: null,

    init() {
        // Setup Canvas
        this.ctx = this.ui.canvas.getContext('2d');
        this.updateCanvasSize(); // Initial setup

        // Event Listeners
        this.setupAuth();
        this.setupSidebar();
        this.setupToolbar();
        this.setupCanvas();
        this.setupPaste();

        // Check Login Status via Sidebar elements (rendered by PHP)
        const userName = document.getElementById('user-name').innerText;
        if (userName !== 'User' && userName !== '') {
            this.state.user = { name: userName }; // Basic check
            this.loadTree();
        }

        // Auto Save Interval
        setInterval(() => this.autoSave(), 3000);

        // Global Click to close context menu
        document.addEventListener('click', () => {
            this.ui.contextMenu.classList.add('hidden');
        });
    },

    setupAuth() {
        // Callback is already defined globally below
        document.getElementById('btn-logout').addEventListener('click', () => {
            fetch('/game/auth/logout.php').then(() => location.reload());
        });
    },

    setupSidebar() {
        document.getElementById('btn-add-folder').addEventListener('click', () => this.createItem('folder'));
        document.getElementById('btn-add-note').addEventListener('click', () => this.createItem('note'));

        // Sidebar Toggle
        this.ui.btnToggleSidebar.addEventListener('click', () => {
            this.ui.sidebar.classList.toggle('collapsed');
        });

        // Context Menu Actions
        this.ui.ctxRename.addEventListener('click', (e) => {
            e.stopPropagation();
            this.renameItem(this.state.contextMenuId);
            this.ui.contextMenu.classList.add('hidden');
        });

        this.ui.ctxDelete.addEventListener('click', (e) => {
            e.stopPropagation();
            this.deleteItem(this.state.contextMenuId);
            this.ui.contextMenu.classList.add('hidden');
        });
    },

    setupToolbar() {
        // Tools
        this.ui.btnHand.addEventListener('click', () => this.setTool('hand'));
        this.ui.btnPen.addEventListener('click', () => this.setTool('pen'));
        this.ui.btnEraser.addEventListener('click', () => this.setTool('eraser'));

        // Image Tool
        this.ui.btnImage.addEventListener('click', () => {
            this.ui.imageInput.click();
        });
        this.ui.imageInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                const reader = new FileReader();
                reader.onload = (evt) => {
                    this.addWidget('image', evt.target.result);
                    // Clear input
                    this.ui.imageInput.value = '';
                };
                reader.readAsDataURL(e.target.files[0]);
            }
        });

        // Code Tool
        this.ui.btnCode.addEventListener('click', () => {
            const code = prompt('Paste your code here:');
            if (code) {
                this.addWidget('code', code);
            }
        });

        this.ui.penSizeInput.addEventListener('input', (e) => {
            this.state.penWidth = parseInt(e.target.value);
        });

        // Canvas Size Inputs
        const updateSize = () => {
            const w = parseInt(this.ui.inputWidth.value) || 2000;
            const h = parseInt(this.ui.inputHeight.value) || 2000;
            this.state.canvasWidth = w;
            this.state.canvasHeight = h;
            this.updateCanvasSize();
            this.state.unsavedChanges = true;
        };

        this.ui.inputWidth.addEventListener('change', updateSize);
        this.ui.inputHeight.addEventListener('change', updateSize);
    },

    setTool(mode) {
        this.state.toolMode = mode;
        // UI Updates
        this.ui.btnHand.classList.toggle('active', mode === 'hand');
        this.ui.btnPen.classList.toggle('active', mode === 'pen');
        this.ui.btnEraser.classList.toggle('active', mode === 'eraser');

        // Cursor
        if (mode === 'hand') {
            this.ui.canvasWrapper.style.cursor = 'grab';
        } else {
            this.ui.canvasWrapper.style.cursor = 'crosshair';
        }
    },

    setupCanvas() {
        const c = this.ui.canvas;
        const wrapper = this.ui.canvasWrapper;

        // Horizontal Scroll with Shift+Wheel
        wrapper.addEventListener('wheel', (e) => {
            if (e.shiftKey) {
                e.preventDefault();
                wrapper.scrollLeft += e.deltaY;
            }
        });

        // Mouse Events
        wrapper.addEventListener('mousedown', (e) => {
            if (this.state.toolMode === 'hand') {
                this.startPanning(e);
            } else {
                // Ensure we are clicking the canvas, not just the wrapper background
                if (e.target === c) {
                    this.startDrawing(e);
                }
            }
        });

        window.addEventListener('mousemove', (e) => {
            if (this.state.isPanning) this.pan(e);
            else if (this.state.isDrawing) this.draw(e);
        });

        window.addEventListener('mouseup', () => {
            if (this.state.isPanning) this.stopPanning();
            if (this.state.isDrawing) this.stopDrawing();
        });

        // Touch support (simplified)
        c.addEventListener('touchstart', (e) => {
            if (this.state.toolMode !== 'hand') {
                e.preventDefault();
                this.startDrawing(e.touches[0]);
            }
        });
        c.addEventListener('touchmove', (e) => {
            if (this.state.toolMode !== 'hand') {
                e.preventDefault();
                this.draw(e.touches[0]);
            }
        });
        c.addEventListener('touchend', () => this.stopDrawing());
    },

    updateCanvasSize() {
        this.ui.canvas.width = this.state.canvasWidth;
        this.ui.canvas.height = this.state.canvasHeight;
        this.ui.noteContainer.style.width = this.state.canvasWidth + 'px';
        this.ui.noteContainer.style.height = this.state.canvasHeight + 'px';

        // Sync inputs
        this.ui.inputWidth.value = this.state.canvasWidth;
        this.ui.inputHeight.value = this.state.canvasHeight;

        if (this.state.activeNote) {
            this.redraw();
        }
    },

    // --- Panning (Hand Tool) ---

    startPanning(e) {
        this.state.isPanning = true;
        this.state.panStartX = e.clientX;
        this.state.panStartY = e.clientY;
        this.state.panStartScrollLeft = this.ui.canvasWrapper.scrollLeft;
        this.state.panStartScrollTop = this.ui.canvasWrapper.scrollTop;
        this.ui.canvasWrapper.style.cursor = 'grabbing';
    },

    pan(e) {
        if (!this.state.isPanning) return;
        const dx = e.clientX - this.state.panStartX;
        const dy = e.clientY - this.state.panStartY;
        this.ui.canvasWrapper.scrollLeft = this.state.panStartScrollLeft - dx;
        this.ui.canvasWrapper.scrollTop = this.state.panStartScrollTop - dy;
    },

    stopPanning() {
        this.state.isPanning = false;
        if (this.state.toolMode === 'hand') {
            this.ui.canvasWrapper.style.cursor = 'grab';
        }
    },

    // --- Data ---

    loadTree() {
        fetch('api/get_tree.php')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    this.state.tree = data.items;
                    this.renderTree();
                }
            });
    },

    renderTree() {
        this.ui.fileTree.innerHTML = '';
        const roots = this.state.tree.filter(i => !i.parent_id);
        roots.forEach(item => {
            this.ui.fileTree.appendChild(this.createTreeElement(item, 0));
        });
    },

    createTreeElement(item, level) {
        const div = document.createElement('div');
        div.className = `tree-item tree-level-${level + 1}`;
        if (item.id == this.state.activeNoteId) div.classList.add('active');

        // Icon
        const icon = document.createElement('i');
        icon.className = item.type === 'folder' ? 'fas fa-folder' : 'fas fa-file-alt';
        div.appendChild(icon);

        // Title (Span to allow rename later)
        const span = document.createElement('span');
        span.innerText = item.title;
        div.appendChild(span);

        // Click Handler
        div.addEventListener('click', (e) => {
            if (item.type === 'note') {
                this.openNote(item.id);
            } else {
                // Toggle folder
            }
        });

        // Context Menu Handler
        div.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.state.contextMenuId = item.id;
            this.ui.contextMenu.style.left = e.clientX + 'px';
            this.ui.contextMenu.style.top = e.clientY + 'px';
            this.ui.contextMenu.classList.remove('hidden');
        });

        const container = document.createElement('div');
        container.appendChild(div);

        // Children
        if (item.type === 'folder') {
            const children = this.state.tree.filter(i => i.parent_id == item.id);
            children.forEach(child => {
                const childEl = this.createTreeElement(child, level + 1);
                container.appendChild(childEl);
            });
        }

        return container;
    },

    createItem(type) {
        const title = prompt(`Enter ${type} name:`, `New ${type}`);
        if (!title) return;

        fetch('api/create_item.php', {
            method: 'POST',
            body: JSON.stringify({ type, title, parent_id: null })
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    this.loadTree(); // Reload tree
                }
            });
    },

    renameItem(id) {
        const item = this.state.tree.find(i => i.id == id);
        if (!item) return;

        const newTitle = prompt('Rename item:', item.title);
        if (!newTitle || newTitle === item.title) return;

        fetch('api/update_item.php', {
            method: 'POST',
            body: JSON.stringify({
                id: id,
                title: newTitle
            })
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    this.loadTree();
                }
            });
    },

    deleteItem(id) {
        if (!confirm('Are you sure you want to delete this item?')) return;

        fetch('api/delete_item.php', {
            method: 'POST',
            body: JSON.stringify({
                id: id
            })
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    if (this.state.activeNoteId == id) {
                        this.state.activeNoteId = null;
                        this.state.activeNote = null;
                        this.ui.noteContainer.classList.add('hidden');
                        this.ui.emptyState.classList.remove('hidden');
                    }
                    this.loadTree();
                }
            });
    },

    openNote(id) {
        if (this.state.unsavedChanges) this.saveNote();

        this.state.activeNoteId = id;
        this.renderTree(); // Update active class

        fetch(`api/get_note.php?id=${id}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    this.state.activeNote = data.item;
                    // Parse Content
                    try {
                        const content = JSON.parse(data.item.content || '{"strokes":[],"widgets":[]}');
                        this.state.activeNote.data = content;
                    } catch (e) {
                        this.state.activeNote.data = { strokes: [], widgets: [] };
                    }

                    // Set Size
                    this.state.canvasWidth = this.state.activeNote.data.width || 2000;
                    this.state.canvasHeight = this.state.activeNote.data.height || 2000;
                    this.updateCanvasSize();

                    this.ui.emptyState.classList.add('hidden');
                    this.ui.noteContainer.classList.remove('hidden');
                    this.setTool('pen'); // Default to pen on open
                    this.redraw();
                    this.renderWidgets();
                }
            });
    },

    // --- Drawing ---

    startDrawing(e) {
        if (!this.state.activeNote || this.state.toolMode === 'hand') return;

        // Deselect widgets
        document.querySelectorAll('.widget.selected').forEach(w => w.classList.remove('selected'));

        this.state.isDrawing = true;

        const rect = this.ui.canvas.getBoundingClientRect();
        this.state.lastX = e.clientX - rect.left;
        this.state.lastY = e.clientY - rect.top;

        // Start a new stroke path
        if (!this.state.activeNote.data.strokes) this.state.activeNote.data.strokes = [];

        // Determine stroke properties based on current tool mode
        let composite = 'source-over';
        let color = '#ffffff';
        let width = this.state.penWidth;

        if (this.state.toolMode === 'eraser') {
            composite = 'destination-out';
            width = width * 5; // Eraser usually bigger
        }

        this.state.currentStroke = {
            mode: this.state.toolMode, // Saved for recreation
            color: color,
            width: width,
            composite: composite,
            points: [{ x: this.state.lastX, y: this.state.lastY }]
        };
        this.state.activeNote.data.strokes.push(this.state.currentStroke);
    },

    draw(e) {
        if (!this.state.isDrawing) return;

        const rect = this.ui.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        this.ctx.beginPath();
        this.ctx.lineWidth = this.state.currentStroke.width;
        this.ctx.lineCap = 'round';
        this.ctx.strokeStyle = this.state.currentStroke.color;
        this.ctx.globalCompositeOperation = this.state.currentStroke.composite;

        this.ctx.moveTo(this.state.lastX, this.state.lastY);
        this.ctx.lineTo(x, y);
        this.ctx.stroke();

        // Reset composite to default for other operations (safety)
        this.ctx.globalCompositeOperation = 'source-over';

        this.state.currentStroke.points.push({ x, y });

        this.state.lastX = x;
        this.state.lastY = y;
        this.state.unsavedChanges = true;
        this.updateSaveStatus('Unsaved');
    },

    stopDrawing() {
        this.state.isDrawing = false;
    },

    redraw() {
        this.ctx.clearRect(0, 0, this.ui.canvas.width, this.ui.canvas.height);
        if (!this.state.activeNote || !this.state.activeNote.data.strokes) return;

        this.state.activeNote.data.strokes.forEach(stroke => {
            if (stroke.points.length < 2) return;
            this.ctx.beginPath();

            // Backwards compatibility or default values
            this.ctx.lineWidth = stroke.width || 3;
            this.ctx.strokeStyle = stroke.color || '#ffffff';
            this.ctx.lineCap = 'round';
            this.ctx.globalCompositeOperation = stroke.composite || (stroke.mode === 'eraser' ? 'destination-out' : 'source-over');

            this.ctx.moveTo(stroke.points[0].x, stroke.points[0].y);

            for (let i = 1; i < stroke.points.length; i++) {
                this.ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
            }
            this.ctx.stroke();
        });

        // Always reset
        this.ctx.globalCompositeOperation = 'source-over';
    },

    // --- Paste ---

    setupPaste() {
        window.addEventListener('paste', (e) => {
            if (!this.state.activeNote) return;
            const items = (e.clipboardData || e.originalEvent.clipboardData).items;

            for (let item of items) {
                if (item.type.indexOf('image') === 0) {
                    const blob = item.getAsFile();
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        this.addWidget('image', event.target.result);
                    };
                    reader.readAsDataURL(blob);
                } else if (item.type === 'text/plain') {
                    item.getAsString((text) => {
                        this.addWidget('code', text);
                    });
                }
            }
        });
    },

    addWidget(type, content) {
        if (!this.state.activeNote.data.widgets) this.state.activeNote.data.widgets = [];

        const widget = {
            type: type,
            content: content,
            x: 50,
            y: 50,
            id: Date.now()
        };

        this.state.activeNote.data.widgets.push(widget);
        this.renderWidgetElement(widget);
        this.state.unsavedChanges = true;
    },

    // --- Widgets Logic ---

    renderWidgets() {
        this.ui.widgetsLayer.innerHTML = '';
        if (!this.state.activeNote.data.widgets) return;
        this.state.activeNote.data.widgets.forEach(w => this.renderWidgetElement(w));
    },

    renderWidgetElement(widget) {
        const el = document.createElement('div');
        el.className = 'widget';
        el.dataset.id = widget.id;
        el.style.left = widget.x + 'px';
        el.style.top = widget.y + 'px';
        if (widget.width) el.style.width = widget.width + 'px';
        if (widget.height) el.style.height = widget.height + 'px';

        // Content
        if (widget.type === 'image') {
            const img = document.createElement('img');
            img.src = widget.content;
            el.appendChild(img);
        } else {
            const pre = document.createElement('pre');
            pre.innerText = widget.content;
            el.appendChild(pre);
        }

        // Resize Handles
        const handles = ['nw', 'ne', 'sw', 'se'];
        handles.forEach(h => {
            const handle = document.createElement('div');
            handle.className = `resize-handle handle-${h}`;
            handle.dataset.handle = h;
            el.appendChild(handle);
        });

        // Move Handle
        const moveHandle = document.createElement('div');
        moveHandle.className = 'move-handle';
        moveHandle.innerText = 'Drag';
        el.appendChild(moveHandle);

        // Delete Button
        const deleteBtn = document.createElement('div');
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = '<i class="fas fa-times"></i>';
        deleteBtn.title = 'Delete';
        deleteBtn.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            this.deleteWidget(widget.id);
        });
        el.appendChild(deleteBtn);

        this.ui.widgetsLayer.appendChild(el);

        // Events
        el.addEventListener('mousedown', (e) => this.onWidgetDown(e, widget, el));
    },

    deleteWidget(id) {
        if (!confirm('Delete this widget?')) return;
        this.state.activeNote.data.widgets = this.state.activeNote.data.widgets.filter(w => w.id !== id);
        this.renderWidgets();
        this.state.unsavedChanges = true;
    },

    onWidgetDown(e, widget, el) {
        if (this.state.toolMode === 'hand') return; // Hand tool takes precedence

        e.stopPropagation(); // Don't draw

        // Select logic
        document.querySelectorAll('.widget').forEach(w => w.classList.remove('selected'));
        el.classList.add('selected');

        const target = e.target;

        if (target.classList.contains('resize-handle')) {
            // Resize Start
            this.startResize(e, widget, el, target.dataset.handle);
        } else {
            // Move Start (default on body or move handle)
            this.startMove(e, widget, el);
        }
    },

    startMove(e, widget, el) {
        let startX = e.clientX;
        let startY = e.clientY;
        let origX = widget.x;
        let origY = widget.y;

        const onMove = (e) => {
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            widget.x = origX + dx;
            widget.y = origY + dy;
            el.style.left = widget.x + 'px';
            el.style.top = widget.y + 'px';
            this.state.unsavedChanges = true;
        };

        const onUp = () => {
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
        };

        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
    },

    startResize(e, widget, el, handle) {
        let startX = e.clientX;
        let startY = e.clientY;

        // Ensure initial width/height are set
        if (!widget.width) widget.width = el.offsetWidth;
        if (!widget.height) widget.height = el.offsetHeight;

        let origW = widget.width;
        let origH = widget.height;
        let origX = widget.x;
        let origY = widget.y;

        // Aspect Ratio
        const ratio = (widget.type === 'image' && origH > 0) ? (origW / origH) : null;

        const onMove = (e) => {
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;

            let newW = origW;
            let newH = origH;
            let newX = origX;
            let newY = origY;

            // Simple Logic: Calculate intended W/H first
            if (handle.includes('e')) newW = origW + dx;
            if (handle.includes('w')) {
                newW = origW - dx;
                newX = origX + dx;
            }
            if (handle.includes('s')) newH = origH + dy;
            if (handle.includes('n')) {
                newH = origH - dy;
                newY = origY + dy;
            }

            // Enforce Aspect Ratio for Images
            if (ratio) {
                if (handle.includes('e') || handle.includes('w')) {
                    newH = newW / ratio;
                    if (handle.includes('n')) newY = (origY + origH) - newH;
                } else if (handle.includes('n') || handle.includes('s')) {
                    newW = newH * ratio;
                }
            }

            // Min constraints only
            if (newW > 50 && newH > 50) {
                widget.width = newW;
                widget.height = newH;
                widget.x = newX;
                widget.y = newY;

                el.style.width = newW + 'px';
                el.style.height = newH + 'px';
                el.style.left = newX + 'px';
                el.style.top = newY + 'px';
            }
            this.state.unsavedChanges = true;
        };

        const onUp = () => {
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
        };

        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
    },

    // --- Save ---

    updateSaveStatus(msg) {
        this.ui.saveStatus.innerText = msg;
    },

    autoSave() {
        if (this.state.unsavedChanges && this.state.activeNote) {
            this.saveNote();
        }
    },

    saveNote() {
        if (!this.state.activeNote) return;
        this.updateSaveStatus('Saving...');

        // Save Dimensions to data
        this.state.activeNote.data.width = this.state.canvasWidth;
        this.state.activeNote.data.height = this.state.canvasHeight;

        const contentStr = JSON.stringify(this.state.activeNote.data);

        fetch('api/update_item.php', {
            method: 'POST',
            body: JSON.stringify({
                id: this.state.activeNoteId,
                content: contentStr
            })
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    this.state.unsavedChanges = false;
                    this.updateSaveStatus('Saved');
                } else {
                    this.updateSaveStatus('Error saving');
                }
            });
    }
};

window.onload = () => App.init();

// Global function for Google Sign-In Callback
window.handleCredentialResponse = (response) => {
    if (!response.credential) return;

    fetch('/game/auth/google_login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential, client_id: response.clientId })
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                location.reload();
            } else {
                console.error('Login failed: ' + (data.error || 'Unknown error'));
            }
        })
        .catch(err => console.error(err));
};