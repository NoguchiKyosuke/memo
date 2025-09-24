// Moved from static/assets/js/health.js
async function fetchHealth(){
  try {
    const res = await fetch('/api/v1/health',{headers:{'Accept':'application/json'}});
    if(!res.ok) throw new Error('status '+res.status);
    const data = await res.json();
    const ok = data.status === 'UP';
    document.getElementById('global-status').innerHTML = `<span class="badge ${ok?'ok':'down'}">GLOBAL ${ok?'UP':'DOWN'}</span>`;
    (data.services||[]).forEach(s => {
      const el = document.querySelector(`.badge[data-service="${s}"]`);
      if(el){ el.textContent = 'UP'; el.classList.remove('loading'); el.classList.add('ok'); }
    });
  } catch(e){
    document.getElementById('global-status').innerHTML = `<span class="badge down">GLOBAL DOWN</span>`;
    document.querySelectorAll('.badge[data-service]').forEach(el=>{el.textContent='DOWN';el.classList.add('down');});
  }
}
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', fetchHealth);
}
