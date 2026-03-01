/**
 * 数学ユーティリティ関数
 */

const mathUtils = {
    /**
     * 数値を指定された精度でフォーマット
     * @param {number} value - フォーマットする数値
     * @param {number} precision - 小数点以下の桁数
     * @param {string} notation - 表記法（'auto', 'fixed', 'scientific', 'engineering'）
     * @returns {string} フォーマットされた数値
     */
    formatNumber: function(value, precision = app.settings.precision, notation = app.settings.notation) {
        if (typeof value !== 'number' || isNaN(value)) {
            return String(value);
        }
        
        // 非常に小さい数値を0として扱う
        if (Math.abs(value) < 1e-15) {
            return '0';
        }
        
        switch (notation) {
            case 'fixed':
                return value.toFixed(precision);
            case 'scientific':
                return value.toExponential(precision);
            case 'engineering':
                const exponent = Math.floor(Math.log10(Math.abs(value)) / 3) * 3;
                const mantissa = value / Math.pow(10, exponent);
                return mantissa.toFixed(precision) + 'e' + exponent;
            case 'auto':
            default:
                if (Math.abs(value) >= 1e4 || (Math.abs(value) < 1e-3 && Math.abs(value) > 0)) {
                    return value.toExponential(precision);
                } else {
                    return value.toFixed(precision).replace(/\.?0+$/, '');
                }
        }
    },
    
    /**
     * 角度を変換（ラジアンと度）
     * @param {number} angle - 変換する角度
     * @param {string} from - 元の単位（'rad'または'deg'）
     * @param {string} to - 変換後の単位（'rad'または'deg'）
     * @returns {number} 変換された角度
     */
    convertAngle: function(angle, from = app.settings.angleUnit, to = 'rad') {
        if (from === to) {
            return angle;
        }
        
        if (from === 'deg' && to === 'rad') {
            return angle * Math.PI / 180;
        }
        
        if (from === 'rad' && to === 'deg') {
            return angle * 180 / Math.PI;
        }
        
        return angle;
    },
    
    /**
     * 複素数をフォーマット
     * @param {Object} complex - 複素数オブジェクト（{re, im}形式）
     * @param {number} precision - 小数点以下の桁数
     * @returns {string} フォーマットされた複素数
     */
    formatComplex: function(complex, precision = app.settings.precision) {
        if (!complex) return '';
        
        const re = this.formatNumber(complex.re, precision);
        const im = this.formatNumber(Math.abs(complex.im), precision);
        
        if (complex.im === 0) {
            return re;
        }
        
        if (complex.re === 0) {
            return complex.im === 1 ? 'i' : complex.im === -1 ? '-i' : `${complex.im > 0 ? im : '-' + im}i`;
        }
        
        return `${re} ${complex.im > 0 ? '+' : '-'} ${complex.im === 1 || complex.im === -1 ? '' : im}i`;
    },
    /**
     * 行列をフォーマット
     * @param {Array} matrix - 行列（2次元配列）
     * @param {number} precision - 小数点以下の桁数
     * @returns {string} フォーマットされた行列
     */
    formatMatrix: function(matrix, precision = app.settings.precision) {
        if (!matrix || !Array.isArray(matrix)) return '';
        
        return '[' + matrix.map(row => 
            '[' + row.map(val => this.formatNumber(val, precision)).join(', ') + ']'
        ).join(', ') + ']';
    },
    
    /**
     * ベクトルをフォーマット
     * @param {Array} vector - ベクトル（1次元配列）
     * @param {number} precision - 小数点以下の桁数
     * @returns {string} フォーマットされたベクトル
     */
    formatVector: function(vector, precision = app.settings.precision) {
        if (!vector || !Array.isArray(vector)) return '';
        
        return '[' + vector.map(val => this.formatNumber(val, precision)).join(', ') + ']';
    },
    
    /**
     * 数式をLaTeX形式に変換
     * @param {string} expression - 変換する数式
     * @returns {string} LaTeX形式の数式
     */
    expressionToLatex: function(expression) {
        try {
            const node = math.parse(expression);
            return node.toTex({
                parenthesis: 'keep',
                implicit: 'show'
            });
        } catch (error) {
            console.error('LaTeX変換エラー:', error);
            return expression;
        }
    },
    
    /**
     * 行列をLaTeX形式に変換
     * @param {Array} matrix - 行列（2次元配列）
     * @param {number} precision - 小数点以下の桁数
     * @returns {string} LaTeX形式の行列
     */
    matrixToLatex: function(matrix, precision = app.settings.precision) {
        if (!matrix || !Array.isArray(matrix)) return '';
        
        return '\\begin{bmatrix} ' + 
            matrix.map(row => 
                row.map(val => this.formatNumber(val, precision)).join(' & ')
            ).join(' \\\\ ') + 
            ' \\end{bmatrix}';
    },
    
    /**
     * ベクトルをLaTeX形式に変換
     * @param {Array} vector - ベクトル（1次元配列）
     * @param {number} precision - 小数点以下の桁数
     * @returns {string} LaTeX形式のベクトル
     */
    vectorToLatex: function(vector, precision = app.settings.precision) {
        if (!vector || !Array.isArray(vector)) return '';
        
        return '\\begin{pmatrix} ' + 
            vector.map(val => this.formatNumber(val, precision)).join(' \\\\ ') + 
            ' \\end{pmatrix}';
    },
    
    /**
     * 複素数をLaTeX形式に変換
     * @param {Object} complex - 複素数オブジェクト（{re, im}形式）
     * @param {number} precision - 小数点以下の桁数
     * @returns {string} LaTeX形式の複素数
     */
    complexToLatex: function(complex, precision = app.settings.precision) {
        if (!complex) return '';
        
        const re = this.formatNumber(complex.re, precision);
        const im = this.formatNumber(Math.abs(complex.im), precision);
        
        if (complex.im === 0) {
            return re;
        }
        
        if (complex.re === 0) {
            return complex.im === 1 ? 'i' : complex.im === -1 ? '-i' : `${complex.im > 0 ? im : '-' + im}i`;
        }
        
        return `${re} ${complex.im > 0 ? '+' : '-'} ${complex.im === 1 || complex.im === -1 ? '' : im}i`;
    },
    
    /**
     * 数値の配列を生成
     * @param {number} start - 開始値
     * @param {number} end - 終了値
     * @param {number} step - ステップ
     * @returns {Array} 数値の配列
     */
    range: function(start, end, step = 1) {
        const result = [];
        for (let i = start; i <= end; i += step) {
            result.push(i);
        }
        return result;
    },
    
    /**
     * 多項式の係数から関数を生成
     * @param {Array} coefficients - 多項式の係数（最高次から順）
     * @returns {Function} 多項式関数
     */
    createPolynomialFunction: function(coefficients) {
        return function(x) {
            let result = 0;
            for (let i = 0; i < coefficients.length; i++) {
                result += coefficients[i] * Math.pow(x, coefficients.length - i - 1);
            }
            return result;
        };
    },
    
    /**
     * 文字列を数値配列に変換
     * @param {string} str - カンマ区切りの数値文字列
     * @returns {Array} 数値の配列
     */
    parseNumberArray: function(str) {
        if (!str) return [];
        return str.split(',').map(item => parseFloat(item.trim())).filter(val => !isNaN(val));
    },
    
    /**
     * 文字列を複素数に変換
     * @param {string} str - 複素数を表す文字列
     * @returns {Object} 複素数オブジェクト（{re, im}形式）
     */
    parseComplex: function(str) {
        try {
            return math.complex(str);
        } catch (error) {
            console.error('複素数解析エラー:', error);
            return { re: 0, im: 0 };
        }
    },
    
    /**
     * 文字列を行列に変換
     * @param {string} str - 行列を表す文字列
     * @returns {Array} 行列（2次元配列）
     */
    parseMatrix: function(str) {
        try {
            return math.evaluate(str).toArray();
        } catch (error) {
            console.error('行列解析エラー:', error);
            return [];
        }
    },
    
    /**
     * 文字列をベクトルに変換
     * @param {string} str - ベクトルを表す文字列
     * @returns {Array} ベクトル（1次元配列）
     */
    parseVector: function(str) {
        try {
            const result = math.evaluate(str);
            return Array.isArray(result) ? result : [result];
        } catch (error) {
            console.error('ベクトル解析エラー:', error);
            return [];
        }
    }
};

// グローバルに公開
window.mathUtils = mathUtils;
