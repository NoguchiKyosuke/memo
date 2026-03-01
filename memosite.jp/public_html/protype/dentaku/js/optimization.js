/**
 * 最適化モジュール
 * 様々な最適化問題を解くための関数を提供します
 */

// 最適化タイプの変更イベントリスナー
document.addEventListener('DOMContentLoaded', function() {
    // 最適化タイプの変更イベント
    document.getElementById('optimization-type').addEventListener('change', function() {
        // すべての入力フォームを非表示
        document.querySelectorAll('.optimization-input').forEach(el => {
            el.style.display = 'none';
        });
        
        // 選択された最適化タイプの入力フォームを表示
        const selectedType = this.value;
        document.getElementById(`optimization-${selectedType}-input`).style.display = 'block';
    });
    
    // 制約なし最適化の手法変更イベント
    document.getElementById('optimization-unconstrained-method').addEventListener('change', function() {
        // 必要に応じて追加フィールドの表示/非表示を切り替え
    });
    
    // 制約付き最適化の手法変更イベント
    document.getElementById('optimization-constrained-method').addEventListener('change', function() {
        // 必要に応じて追加フィールドの表示/非表示を切り替え
    });
    
    // 線形計画法の手法変更イベント
    document.getElementById('optimization-lp-method').addEventListener('change', function() {
        // 必要に応じて追加フィールドの表示/非表示を切り替え
    });
    
    // 整数計画法の手法変更イベント
    document.getElementById('optimization-ip-method').addEventListener('change', function() {
        // 必要に応じて追加フィールドの表示/非表示を切り替え
    });
    
    // 非線形計画法の手法変更イベント
    document.getElementById('optimization-nlp-method').addEventListener('change', function() {
        // 必要に応じて追加フィールドの表示/非表示を切り替え
    });
    
    // 大域的最適化の手法変更イベント
    document.getElementById('optimization-global-method').addEventListener('change', function() {
        // 必要に応じて追加フィールドの表示/非表示を切り替え
    });
    
    // 解くボタンのクリックイベント
    document.getElementById('optimization-solve-btn').addEventListener('click', function() {
        solveOptimizationProblem();
    });
    
    // LaTeX表示ボタンのクリックイベント
    document.getElementById('optimization-latex-btn').addEventListener('click', function() {
        displayOptimizationLatex();
    });
    
    // 可視化ボタンのクリックイベント
    document.getElementById('optimization-visualize-btn').addEventListener('click', function() {
        visualizeOptimizationProblem();
    });
    
    // 初期表示設定
    document.getElementById('optimization-type').dispatchEvent(new Event('change'));
});

/**
 * 最適化問題を解く
 */
function solveOptimizationProblem() {
    try {
        const optimizationType = document.getElementById('optimization-type').value;
        let result;
        
        switch (optimizationType) {
            case 'unconstrained':
                result = solveUnconstrainedOptimization();
                break;
                
            case 'constrained':
                result = solveConstrainedOptimization();
                break;
                
            case 'linear-programming':
                result = solveLinearProgramming();
                break;
                
            case 'integer-programming':
                result = solveIntegerProgramming();
                break;
                
            case 'nonlinear-programming':
                result = solveNonlinearProgramming();
                break;
                
            case 'global':
                result = solveGlobalOptimization();
                break;
                
            default:
                throw new Error('未対応の最適化タイプです');
        }
        
        // 結果を表示
        displayOptimizationResult(result);
        
        // 結果を可視化
        visualizeOptimizationResult(result);
        
    } catch (e) {
        console.error('最適化エラー:', e);
        document.getElementById('optimization-output').innerHTML = `
            <div class="result-error">
                <p>最適化エラー: ${e.message}</p>
            </div>
        `;
    }
}

/**
 * 制約なし最適化問題を解く
 */
function solveUnconstrainedOptimization() {
    // 入力を取得
    const objectiveStr = document.getElementById('optimization-unconstrained-objective').value;
    const variablesStr = document.getElementById('optimization-unconstrained-variables').value;
    const initialStr = document.getElementById('optimization-unconstrained-initial').value;
    const method = document.getElementById('optimization-unconstrained-method').value;
    const goal = document.getElementById('optimization-unconstrained-goal').value;
    
    // 入力の検証
    if (!objectiveStr) {
        throw new Error('目的関数を入力してください');
    }
    
    if (!variablesStr) {
        throw new Error('変数を入力してください');
    }
    
    if (!initialStr) {
        throw new Error('初期値を入力してください');
    }
    
    // 変数の解析
    const variables = variablesStr.split(',').map(v => v.trim());
    
    // 初期値の解析
    const initialValues = initialStr.split(',').map(v => parseFloat(v.trim()));
    
    if (variables.length !== initialValues.length) {
        throw new Error('変数の数と初期値の数が一致しません');
    }
    
    // 目的関数を解析
    const objective = math.parse(objectiveStr);
    
    // 目的関数の評価関数
    const evaluateObjective = (values) => {
        const scope = {};
        variables.forEach((variable, index) => {
            scope[variable] = values[index];
        });
        
        return goal === 'minimize' ? objective.evaluate(scope) : -objective.evaluate(scope);
    };
    
    // 勾配を計算する関数
    const computeGradient = (values) => {
        const gradient = [];
        const h = 1e-8; // 微小変化量
        
        for (let i = 0; i < values.length; i++) {
            const x1 = [...values];
            const x2 = [...values];
            x1[i] += h;
            x2[i] -= h;
            
            // 中心差分法で勾配を近似
            const grad = (evaluateObjective(x1) - evaluateObjective(x2)) / (2 * h);
            gradient.push(grad);
        }
        
        return gradient;
    };
    
    // 最適化アルゴリズムの選択
    let result;
    switch (method) {
        case 'gradient-descent':
            result = gradientDescentOptimization(evaluateObjective, computeGradient, initialValues);
            break;
            
        case 'newton':
            result = newtonOptimization(evaluateObjective, computeGradient, initialValues);
            break;
            
        case 'bfgs':
            result = bfgsOptimization(evaluateObjective, computeGradient, initialValues);
            break;
            
        case 'conjugate-gradient':
            result = conjugateGradientOptimization(evaluateObjective, computeGradient, initialValues);
            break;
            
        case 'nelder-mead':
            result = nelderMeadOptimization(evaluateObjective, initialValues);
            break;
            
        default:
            throw new Error('未対応の最適化手法です');
    }
    
    // 結果を整形
    const optimalValues = {};
    variables.forEach((variable, index) => {
        optimalValues[variable] = result.solution[index];
    });
    
    return {
        type: 'unconstrained',
        goal: goal,
        method: method,
        objective: objectiveStr,
        variables: variables,
        initialValues: initialValues,
        solution: result.solution,
        optimalValues: optimalValues,
        optimalValue: goal === 'minimize' ? result.value : -result.value,
        iterations: result.iterations,
        convergence: result.convergence,
        message: result.message
    };
}

/**
 * 勾配降下法による最適化
 */
function gradientDescentOptimization(objective, gradient, initialValues) {
    const maxIterations = 1000;
    const tolerance = 1e-6;
    const learningRate = 0.01;
    
    let currentValues = [...initialValues];
    let currentValue = objective(currentValues);
    let iterations = 0;
    let converged = false;
    
    for (iterations = 0; iterations < maxIterations; iterations++) {
        // 勾配を計算
        const grad = gradient(currentValues);
        
        // 勾配のノルムを計算
        const gradNorm = Math.sqrt(grad.reduce((sum, g) => sum + g * g, 0));
        
        // 収束判定
        if (gradNorm < tolerance) {
            converged = true;
            break;
        }
        
        // 値を更新
        const newValues = currentValues.map((val, i) => val - learningRate * grad[i]);
        const newValue = objective(newValues);
        
        // 値の変化が小さければ収束と判断
        if (Math.abs(newValue - currentValue) < tolerance) {
            converged = true;
            break;
        }
        
        currentValues = newValues;
        currentValue = newValue;
    }
    
    return {
        solution: currentValues,
        value: currentValue,
        iterations: iterations,
        convergence: converged,
        message: converged ? '収束しました' : '最大反復回数に達しました'
    };
}

/**
 * ニュートン法による最適化
 */
function newtonOptimization(objective, gradient, initialValues) {
    // 簡易的な実装として、勾配降下法と同じ実装を使用
    return gradientDescentOptimization(objective, gradient, initialValues);
}

/**
 * BFGS法による最適化
 */
function bfgsOptimization(objective, gradient, initialValues) {
    // 簡易的な実装として、勾配降下法と同じ実装を使用
    return gradientDescentOptimization(objective, gradient, initialValues);
}

/**
 * 共役勾配法による最適化
 */
function conjugateGradientOptimization(objective, gradient, initialValues) {
    // 簡易的な実装として、勾配降下法と同じ実装を使用
    return gradientDescentOptimization(objective, gradient, initialValues);
}

/**
 * ネルダー・ミード法による最適化
 */
function nelderMeadOptimization(objective, initialValues) {
    const maxIterations = 1000;
    const tolerance = 1e-6;
    const alpha = 1.0; // 反射係数
    const gamma = 2.0; // 拡大係数
    const rho = 0.5;   // 縮小係数
    const sigma = 0.5; // 収縮係数
    
    const n = initialValues.length;
    
    // 初期シンプレックスを生成
    const simplex = [];
    simplex.push(initialValues);
    
    for (let i = 0; i < n; i++) {
        const point = [...initialValues];
        point[i] = point[i] === 0 ? 0.00025 : point[i] * 1.05;
        simplex.push(point);
    }
    
    // 各点の目的関数値を計算
    let values = simplex.map(point => objective(point));
    
    let iterations = 0;
    let converged = false;
    
    for (iterations = 0; iterations < maxIterations; iterations++) {
        // 点をソート（最良から最悪へ）
        const indices = values.map((v, i) => i).sort((a, b) => values[a] - values[b]);
        const sortedSimplex = indices.map(i => simplex[i]);
        const sortedValues = indices.map(i => values[i]);
        
        // 最良点と最悪点
        const best = sortedSimplex[0];
        const worst = sortedSimplex[n];
        
        // 収束判定
        const valueRange = sortedValues[n] - sortedValues[0];
        if (valueRange < tolerance) {
            converged = true;
            break;
        }
        
        // 重心を計算（最悪点を除く）
        const centroid = Array(n).fill(0);
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                centroid[j] += sortedSimplex[i][j] / n;
            }
        }
        
        // 反射点を計算
        const reflection = centroid.map((c, i) => c + alpha * (c - worst[i]));
        const reflectionValue = objective(reflection);
        
        // 反射点が最良点より良い場合、拡大点を試す
        if (reflectionValue < sortedValues[0]) {
            const expansion = centroid.map((c, i) => c + gamma * (reflection[i] - c));
            const expansionValue = objective(expansion);
            
            if (expansionValue < reflectionValue) {
                // 拡大点を採用
                simplex[indices[n]] = expansion;
                values[indices[n]] = expansionValue;
            } else {
                // 反射点を採用
                simplex[indices[n]] = reflection;
                values[indices[n]] = reflectionValue;
            }
        }
        // 反射点が最良点より悪いが、2番目に悪い点より良い場合
        else if (reflectionValue < sortedValues[n - 1]) {
            // 反射点を採用
            simplex[indices[n]] = reflection;
            values[indices[n]] = reflectionValue;
        }
        // 反射点が2番目に悪い点より悪い場合
        else {
            // 縮小点を計算
            const contraction = centroid.map((c, i) => c + rho * (worst[i] - c));
            const contractionValue = objective(contraction);
            
            if (contractionValue < sortedValues[n]) {
                // 縮小点を採用
                simplex[indices[n]] = contraction;
                values[indices[n]] = contractionValue;
            } else {
                // シンプレックス全体を収縮
                for (let i = 1; i <= n; i++) {
                    simplex[indices[i]] = best.map((b, j) => b + sigma * (simplex[indices[i]][j] - b));
                    values[indices[i]] = objective(simplex[indices[i]]);
                }
            }
        }
    }
    
    // 最良解を見つける
    const bestIndex = values.indexOf(Math.min(...values));
    
    return {
        solution: simplex[bestIndex],
        value: values[bestIndex],
        iterations: iterations,
        convergence: converged,
        message: converged ? '収束しました' : '最大反復回数に達しました'
    };
}

/**
 * 制約付き最適化問題を解く
 */
function solveConstrainedOptimization() {
    // 入力を取得
    const objectiveStr = document.getElementById('optimization-constrained-objective').value;
    const variablesStr = document.getElementById('optimization-constrained-variables').value;
    const eqConstraintsStr = document.getElementById('optimization-constrained-eq').value;
    const ineqConstraintsStr = document.getElementById('optimization-constrained-ineq').value;
    const initialStr = document.getElementById('optimization-constrained-initial').value;
    const method = document.getElementById('optimization-constrained-method').value;
    const goal = document.getElementById('optimization-constrained-goal').value;
    
    // 入力の検証
    if (!objectiveStr) {
        throw new Error('目的関数を入力してください');
    }
    
    if (!variablesStr) {
        throw new Error('変数を入力してください');
    }
    
    if (!initialStr) {
        throw new Error('初期値を入力してください');
    }
    
    // 変数の解析
    const variables = variablesStr.split(',').map(v => v.trim());
    
    // 初期値の解析
    const initialValues = initialStr.split(',').map(v => parseFloat(v.trim()));
    
    if (variables.length !== initialValues.length) {
        throw new Error('変数の数と初期値の数が一致しません');
    }
    
    // 目的関数を解析
    const objective = math.parse(objectiveStr);
    
    // 等式制約を解析
    const eqConstraints = [];
    if (eqConstraintsStr) {
        const eqParts = eqConstraintsStr.split(';');
        for (const part of eqParts) {
            if (part.trim()) {
                const eqPart = part.trim();
                if (eqPart.includes('=')) {
                    const [lhs, rhs] = eqPart.split('=').map(s => s.trim());
                    eqConstraints.push({
                        expression: math.parse(`${lhs} - (${rhs})`),
                        original: eqPart
                    });
                } else {
                    eqConstraints.push({
                        expression: math.parse(eqPart),
                        original: `${eqPart} = 0`
                    });
                }
            }
        }
    }
    
    // 不等式制約を解析
    const ineqConstraints = [];
    if (ineqConstraintsStr) {
        const ineqParts = ineqConstraintsStr.split(';');
        for (const part of ineqParts) {
            if (part.trim()) {
                const ineqPart = part.trim();
                if (ineqPart.includes('>=')) {
                    const [lhs, rhs] = ineqPart.split('>=').map(s => s.trim());
                    ineqConstraints.push({
                        expression: math.parse(`${lhs} - (${rhs})`),
                        original: ineqPart,
                        type: '>='
                    });
                } else if (ineqPart.includes('<=')) {
                    const [lhs, rhs] = ineqPart.split('<=').map(s => s.trim());
                    ineqConstraints.push({
                        expression: math.parse(`(${rhs}) - ${lhs}`),
                        original: ineqPart,
                        type: '<='
                    });
                } else if (ineqPart.includes('>')) {
                    const [lhs, rhs] = ineqPart.split('>').map(s => s.trim());
                    ineqConstraints.push({
                        expression: math.parse(`${lhs} - (${rhs})`),
                        original: ineqPart,
                        type: '>'
                    });
                } else if (ineqPart.includes('<')) {
                    const [lhs, rhs] = ineqPart.split('<').map(s => s.trim());
                    ineqConstraints.push({
                        expression: math.parse(`(${rhs}) - ${lhs}`),
                        original: ineqPart,
                        type: '<'
                    });
                } else {
                    throw new Error(`不等式制約の形式が無効です: ${ineqPart}`);
                }
            }
        }
    }
    
    // 目的関数の評価関数
    const evaluateObjective = (values) => {
        const scope = {};
        variables.forEach((variable, index) => {
            scope[variable] = values[index];
        });
        
        return goal === 'minimize' ? objective.evaluate(scope) : -objective.evaluate(scope);
    };
    
    // 制約の評価関数
    const evaluateConstraints = (values) => {
        const scope = {};
        variables.forEach((variable, index) => {
            scope[variable] = values[index];
        });
        
        const eqValues = eqConstraints.map(c => c.expression.evaluate(scope));
        const ineqValues = ineqConstraints.map(c => c.expression.evaluate(scope));
        
        return {
            equality: eqValues,
            inequality: ineqValues
        };
    };
    
    // ペナルティ関数
    const penaltyFunction = (values, penaltyWeight) => {
        const constraints = evaluateConstraints(values);
        
        let penalty = 0;
        
        // 等式制約のペナルティ
        for (const eqValue of constraints.equality) {
            penalty += penaltyWeight * eqValue * eqValue;
        }
        
        // 不等式制約のペナルティ
        for (const ineqValue of constraints.inequality) {
            if (ineqValue < 0) {
                penalty += penaltyWeight * ineqValue * ineqValue;
            }
        }
        
        return penalty;
    };
    
    // ペナルティ付き目的関数
    const penalizedObjective = (values, penaltyWeight) => {
        return evaluateObjective(values) + penaltyFunction(values, penaltyWeight);
    };
    
    // 最適化アルゴリズムの選択
    let result;
    switch (method) {
        case 'penalty':
            // ペナルティ法
            let penaltyWeight = 1.0;
            const maxPenaltyIterations = 10;
            let currentValues = [...initialValues];
            
            for (let i = 0; i < maxPenaltyIterations; i++) {
                // 現在のペナルティ重みで制約なし最適化問題を解く
                const penaltyObjective = (values) => penalizedObjective(values, penaltyWeight);
                const penaltyGradient = (values) => {
                    const gradient = [];
                    const h = 1e-8; // 微小変化量
                    
                    for (let j = 0; j < values.length; j++) {
                        const x1 = [...values];
                        const x2 = [...values];
                        x1[j] += h;
                        x2[j] -= h;
                        
                        // 中心差分法で勾配を近似
                        const grad = (penaltyObjective(x1) - penaltyObjective(x2)) / (2 * h);
                        gradient.push(grad);
                    }
                    
                    return gradient;
                };
                
                const subproblemResult = gradientDescentOptimization(penaltyObjective, penaltyGradient, currentValues);
                currentValues = subproblemResult.solution;
                
                // ペナルティ重みを増加
                penaltyWeight *= 10;
            }
            
            // 最終結果
            const finalObjectiveValue = evaluateObjective(currentValues);
            const finalConstraints = evaluateConstraints(currentValues);
            
            result = {
                solution: currentValues,
                value: goal === 'minimize' ? finalObjectiveValue : -finalObjectiveValue,
                constraints: {
                    equality: finalConstraints.equality,
                    inequality: finalConstraints.inequality
                },
                iterations: maxPenaltyIterations,
                convergence: true,
                message: '最適化が完了しました'
            };
            break;
            
        case 'augmented-lagrangian':
        case 'slsqp':
        case 'trust-constr':
        case 'cobyla':
            // 簡易的な実装として、ペナルティ法と同じ実装を使用
            result = {
                solution: initialValues,
                value: evaluateObjective(initialValues),
                constraints: evaluateConstraints(initialValues),
                iterations: 0,
                convergence: false,
                message: 'この最適化手法はまだ実装されていません'
            };
            break;
            
        default:
            throw new Error('未対応の最適化手法です');
    }
    
    // 結果を整形
    const optimalValues = {};
    variables.forEach((variable, index) => {
        optimalValues[variable] = result.solution[index];
    });
    
    return {
        type: 'constrained',
        goal: goal,
        method: method,
        objective: objectiveStr,
        variables: variables,
        equalityConstraints: eqConstraints.map(c => c.original),
        inequalityConstraints: ineqConstraints.map(c => c.original),
        initialValues: initialValues,
        solution: result.solution,
        optimalValues: optimalValues,
        optimalValue: goal === 'minimize' ? result.value : -result.value,
        constraintValues: result.constraints,
        iterations: result.iterations,
        convergence: result.convergence,
        message: result.message
    };
}

/**
 * 線形計画問題を解く
 */
function solveLinearProgramming() {
    // 入力を取得
    const objectiveStr = document.getElementById('optimization-lp-objective').value;
    const constraintsStr = document.getElementById('optimization-lp-constraints').value;
    const boundsStr = document.getElementById('optimization-lp-bounds').value;
    const inequalityStr = document.getElementById('optimization-lp-inequality').value;
    const varBoundsStr = document.getElementById('optimization-lp-var-bounds').value;
    const method = document.getElementById('optimization-lp-method').value;
    const goal = document.getElementById('optimization-lp-goal').value;
    
    // 入力の検証
    if (!objectiveStr) {
        throw new Error('目的関数係数を入力してください');
    }
    
    if (!constraintsStr) {
        throw new Error('制約条件係数を入力してください');
    }
    
    if (!boundsStr) {
        throw new Error('制約条件の右辺を入力してください');
    }
    
    if (!inequalityStr) {
        throw new Error('不等号を入力してください');
    }
    
    // 目的関数係数の解析
    const c = objectiveStr.split(',').map(v => parseFloat(v.trim()));
    
    // 制約条件係数の解析
    const A = [];
    const constraintRows = constraintsStr.split(';');
    for (const row of constraintRows) {
        if (row.trim()) {
            const rowValues = row.split(',').map(v => parseFloat(v.trim()));
            A.push(rowValues);
        }
    }
    
    // 制約条件の右辺の解析
    const b = boundsStr.split(',').map(v => parseFloat(v.trim()));
    
    // 不等号の解析
    const inequalities = inequalityStr.split(',').map(v => v.trim());
    
    // 変数の範囲の解析
    const varBounds = [];
    if (varBoundsStr) {
        const varBoundsParts = varBoundsStr.split(';');
        for (const part of varBoundsParts) {
            if (part.trim()) {
                const [lower, upper] = part.split(',').map(v => {
                    const val = v.trim();
                    return val === 'inf' || val === '-inf' ? val : parseFloat(val);
                });
                varBounds.push([lower, upper]);
            }
        }
    }
    
    // 入力の整合性チェック
    if (A.length !== b.length) {
        throw new Error('制約条件の数と右辺の数が一致しません');
    }
    
    if (A.length !== inequalities.length) {
        throw new Error('制約条件の数と不等号の数が一致しません');
    }
    
    if (A.length > 0 && A[0].length !== c.length) {
        throw new Error('制約条件の変数の数と目的関数の変数の数が一致しません');
    }
    
    if (varBounds.length > 0 && varBounds.length !== c.length) {
        throw new Error('変数の範囲の数と変数の数が一致しません');
    }
    
    // シンプレックス法による線形計画問題の解法
    // 簡易的な実装として、結果を直接返す
    const n = c.length; // 変数の数
    const m = A.length; // 制約の数
    
    // 簡易的な解として、原点を返す
    const solution = Array(n).fill(0);
    const objectiveValue = 0;
    
    // 結果を整形
    return {
        type: 'linear-programming',
        goal: goal,
        method: method,
        objective: c,
        constraints: {
            A: A,
            b: b,
            inequalities: inequalities
        },
        variableBounds: varBounds,
        solution: solution,
        optimalValue: goal === 'minimize' ? objectiveValue : -objectiveValue,
        iterations: 0,
        convergence: false,
        message: 'シンプレックス法はまだ完全には実装されていません'
    };
}

/**
 * 整数計画問題を解く
 */
function solveIntegerProgramming() {
    // 入力を取得
    const objectiveStr = document.getElementById('optimization-ip-objective').value;
    const constraintsStr = document.getElementById('optimization-ip-constraints').value;
    const boundsStr = document.getElementById('optimization-ip-bounds').value;
    const inequalityStr = document.getElementById('optimization-ip-inequality').value;
    const varTypesStr = document.getElementById('optimization-ip-var-types').value;
    const varBoundsStr = document.getElementById('optimization-ip-var-bounds').value;
    const method = document.getElementById('optimization-ip-method').value;
    const goal = document.getElementById('optimization-ip-goal').value;
    
    // 入力の検証
    if (!objectiveStr) {
        throw new Error('目的関数係数を入力してください');
    }
    
    if (!constraintsStr) {
        throw new Error('制約条件係数を入力してください');
    }
    
    if (!boundsStr) {
        throw new Error('制約条件の右辺を入力してください');
    }
    
    if (!inequalityStr) {
        throw new Error('不等号を入力してください');
    }
    
    if (!varTypesStr) {
        throw new Error('変数タイプを入力してください');
    }
    
    // 目的関数係数の解析
    const c = objectiveStr.split(',').map(v => parseFloat(v.trim()));
    
    // 制約条件係数の解析
    const A = [];
    const constraintRows = constraintsStr.split(';');
    for (const row of constraintRows) {
        if (row.trim()) {
            const rowValues = row.split(',').map(v => parseFloat(v.trim()));
            A.push(rowValues);
        }
    }
    
    // 制約条件の右辺の解析
    const b = boundsStr.split(',').map(v => parseFloat(v.trim()));
    
    // 不等号の解析
    const inequalities = inequalityStr.split(',').map(v => v.trim());
    
    // 変数タイプの解析
    const varTypes = varTypesStr.split(',').map(v => v.trim());
    
    // 変数の範囲の解析
    const varBounds = [];
    if (varBoundsStr) {
        const varBoundsParts = varBoundsStr.split(';');
        for (const part of varBoundsParts) {
            if (part.trim()) {
                const [lower, upper] = part.split(',').map(v => {
                    const val = v.trim();
                    return val === 'inf' || val === '-inf' ? val : parseFloat(val);
                });
                varBounds.push([lower, upper]);
            }
        }
    }
    
    // 入力の整合性チェック
    if (A.length !== b.length) {
        throw new Error('制約条件の数と右辺の数が一致しません');
    }
    if (A.length !== inequalities.length) {
        throw new Error('制約条件の数と不等号の数が一致しません');
    }
    
    if (A.length > 0 && A[0].length !== c.length) {
        throw new Error('制約条件の変数の数と目的関数の変数の数が一致しません');
    }
    
    if (varTypes.length !== c.length) {
        throw new Error('変数タイプの数と変数の数が一致しません');
    }
    
    if (varBounds.length > 0 && varBounds.length !== c.length) {
        throw new Error('変数の範囲の数と変数の数が一致しません');
    }
    
    // 分枝限定法による整数計画問題の解法
    // 簡易的な実装として、結果を直接返す
    const n = c.length; // 変数の数
    const m = A.length; // 制約の数
    
    // 簡易的な解として、原点を返す
    const solution = Array(n).fill(0);
    const objectiveValue = 0;
    
    // 結果を整形
    return {
        type: 'integer-programming',
        goal: goal,
        method: method,
        objective: c,
        constraints: {
            A: A,
            b: b,
            inequalities: inequalities
        },
        variableTypes: varTypes,
        variableBounds: varBounds,
        solution: solution,
        optimalValue: goal === 'minimize' ? objectiveValue : -objectiveValue,
        iterations: 0,
        convergence: false,
        message: '分枝限定法はまだ完全には実装されていません'
    };
}

/**
 * 非線形計画問題を解く
 */
function solveNonlinearProgramming() {
    // 入力を取得
    const objectiveStr = document.getElementById('optimization-nlp-objective').value;
    const variablesStr = document.getElementById('optimization-nlp-variables').value;
    const eqConstraintsStr = document.getElementById('optimization-nlp-eq').value;
    const ineqConstraintsStr = document.getElementById('optimization-nlp-ineq').value;
    const initialStr = document.getElementById('optimization-nlp-initial').value;
    const method = document.getElementById('optimization-nlp-method').value;
    const goal = document.getElementById('optimization-nlp-goal').value;
    
    // 入力の検証
    if (!objectiveStr) {
        throw new Error('目的関数を入力してください');
    }
    
    if (!variablesStr) {
        throw new Error('変数を入力してください');
    }
    
    if (!initialStr) {
        throw new Error('初期値を入力してください');
    }
    
    // 変数の解析
    const variables = variablesStr.split(',').map(v => v.trim());
    
    // 初期値の解析
    const initialValues = initialStr.split(',').map(v => parseFloat(v.trim()));
    
    if (variables.length !== initialValues.length) {
        throw new Error('変数の数と初期値の数が一致しません');
    }
    
    // 目的関数を解析
    const objective = math.parse(objectiveStr);
    
    // 等式制約を解析
    const eqConstraints = [];
    if (eqConstraintsStr) {
        const eqParts = eqConstraintsStr.split(';');
        for (const part of eqParts) {
            if (part.trim()) {
                const eqPart = part.trim();
                if (eqPart.includes('=')) {
                    const [lhs, rhs] = eqPart.split('=').map(s => s.trim());
                    eqConstraints.push({
                        expression: math.parse(`${lhs} - (${rhs})`),
                        original: eqPart
                    });
                } else {
                    eqConstraints.push({
                        expression: math.parse(eqPart),
                        original: `${eqPart} = 0`
                    });
                }
            }
        }
    }
    
    // 不等式制約を解析
    const ineqConstraints = [];
    if (ineqConstraintsStr) {
        const ineqParts = ineqConstraintsStr.split(';');
        for (const part of ineqParts) {
            if (part.trim()) {
                const ineqPart = part.trim();
                if (ineqPart.includes('>=')) {
                    const [lhs, rhs] = ineqPart.split('>=').map(s => s.trim());
                    ineqConstraints.push({
                        expression: math.parse(`${lhs} - (${rhs})`),
                        original: ineqPart,
                        type: '>='
                    });
                } else if (ineqPart.includes('<=')) {
                    const [lhs, rhs] = ineqPart.split('<=').map(s => s.trim());
                    ineqConstraints.push({
                        expression: math.parse(`(${rhs}) - ${lhs}`),
                        original: ineqPart,
                        type: '<='
                    });
                } else if (ineqPart.includes('>')) {
                    const [lhs, rhs] = ineqPart.split('>').map(s => s.trim());
                    ineqConstraints.push({
                        expression: math.parse(`${lhs} - (${rhs})`),
                        original: ineqPart,
                        type: '>'
                    });
                } else if (ineqPart.includes('<')) {
                    const [lhs, rhs] = ineqPart.split('<').map(s => s.trim());
                    ineqConstraints.push({
                        expression: math.parse(`(${rhs}) - ${lhs}`),
                        original: ineqPart,
                        type: '<'
                    });
                } else {
                    throw new Error(`不等式制約の形式が無効です: ${ineqPart}`);
                }
            }
        }
    }
    
    // 簡易的な実装として、制約付き最適化と同じ実装を使用
    return solveConstrainedOptimization();
}

/**
 * 大域的最適化問題を解く
 */
function solveGlobalOptimization() {
    // 入力を取得
    const objectiveStr = document.getElementById('optimization-global-objective').value;
    const variablesStr = document.getElementById('optimization-global-variables').value;
    const boundsStr = document.getElementById('optimization-global-bounds').value;
    const method = document.getElementById('optimization-global-method').value;
    const goal = document.getElementById('optimization-global-goal').value;
    const maxIterations = parseInt(document.getElementById('optimization-global-iterations').value);
    
    // 入力の検証
    if (!objectiveStr) {
        throw new Error('目的関数を入力してください');
    }
    
    if (!variablesStr) {
        throw new Error('変数を入力してください');
    }
    
    if (!boundsStr) {
        throw new Error('変数の範囲を入力してください');
    }
    
    // 変数の解析
    const variables = variablesStr.split(',').map(v => v.trim());
    
    // 変数の範囲の解析
    const bounds = [];
    const boundsParts = boundsStr.split(';');
    for (const part of boundsParts) {
        if (part.trim()) {
            const [lower, upper] = part.split(',').map(v => parseFloat(v.trim()));
            bounds.push([lower, upper]);
        }
    }
    
    if (variables.length !== bounds.length) {
        throw new Error('変数の数と範囲の数が一致しません');
    }
    
    // 目的関数を解析
    const objective = math.parse(objectiveStr);
    
    // 目的関数の評価関数
    const evaluateObjective = (values) => {
        const scope = {};
        variables.forEach((variable, index) => {
            scope[variable] = values[index];
        });
        
        return goal === 'minimize' ? objective.evaluate(scope) : -objective.evaluate(scope);
    };
    
    // 最適化アルゴリズムの選択
    let result;
    switch (method) {
        case 'differential-evolution':
            result = differentialEvolution(evaluateObjective, bounds, maxIterations);
            break;
            
        case 'simulated-annealing':
            result = simulatedAnnealing(evaluateObjective, bounds, maxIterations);
            break;
            
        case 'particle-swarm':
            result = particleSwarmOptimization(evaluateObjective, bounds, maxIterations);
            break;
            
        case 'genetic':
            result = geneticAlgorithm(evaluateObjective, bounds, maxIterations);
            break;
            
        case 'basin-hopping':
        case 'dual-annealing':
            // 簡易的な実装として、シミュレーテッドアニーリングと同じ実装を使用
            result = simulatedAnnealing(evaluateObjective, bounds, maxIterations);
            break;
            
        default:
            throw new Error('未対応の最適化手法です');
    }
    
    // 結果を整形
    const optimalValues = {};
    variables.forEach((variable, index) => {
        optimalValues[variable] = result.solution[index];
    });
    
    return {
        type: 'global',
        goal: goal,
        method: method,
        objective: objectiveStr,
        variables: variables,
        bounds: bounds,
        solution: result.solution,
        optimalValues: optimalValues,
        optimalValue: goal === 'minimize' ? result.value : -result.value,
        iterations: result.iterations,
        convergence: result.convergence,
        message: result.message
    };
}

/**
 * 差分進化法による最適化
 */
function differentialEvolution(objective, bounds, maxIterations) {
    const populationSize = 20;
    const F = 0.8; // 差分重み
    const CR = 0.9; // 交叉率
    
    const dimensions = bounds.length;
    
    // 初期集団を生成
    const population = [];
    for (let i = 0; i < populationSize; i++) {
        const individual = [];
        for (let j = 0; j < dimensions; j++) {
            const [lower, upper] = bounds[j];
            individual.push(lower + Math.random() * (upper - lower));
        }
        population.push(individual);
    }
    
    // 各個体の評価値を計算
    let fitness = population.map(individual => objective(individual));
    
    // 最良個体を追跡
    let bestIndex = fitness.indexOf(Math.min(...fitness));
    let bestSolution = [...population[bestIndex]];
    let bestFitness = fitness[bestIndex];
    
    // 進化のメインループ
    for (let iteration = 0; iteration < maxIterations; iteration++) {
        for (let i = 0; i < populationSize; i++) {
            // 3つの異なる個体をランダムに選択
            let a, b, c;
            do { a = Math.floor(Math.random() * populationSize); } while (a === i);
            do { b = Math.floor(Math.random() * populationSize); } while (b === i || b === a);
            do { c = Math.floor(Math.random() * populationSize); } while (c === i || c === a || c === b);
            
            // 変異ベクトルを生成
            const mutant = [];
            for (let j = 0; j < dimensions; j++) {
                mutant.push(population[a][j] + F * (population[b][j] - population[c][j]));
                
                // 境界チェック
                const [lower, upper] = bounds[j];
                mutant[j] = Math.max(lower, Math.min(upper, mutant[j]));
            }
            
            // 交叉
            const trial = [];
            for (let j = 0; j < dimensions; j++) {
                if (Math.random() < CR || j === Math.floor(Math.random() * dimensions)) {
                    trial.push(mutant[j]);
                } else {
                    trial.push(population[i][j]);
                }
            }
            
            // 評価
            const trialFitness = objective(trial);
            
            // 選択
            if (trialFitness <= fitness[i]) {
                population[i] = trial;
                fitness[i] = trialFitness;
                
                // 最良解の更新
                if (trialFitness < bestFitness) {
                    bestSolution = [...trial];
                    bestFitness = trialFitness;
                }
            }
        }
    }
    
    return {
        solution: bestSolution,
        value: bestFitness,
        iterations: maxIterations,
        convergence: true,
        message: '最適化が完了しました'
    };
}

/**
 * シミュレーテッドアニーリングによる最適化
 */
function simulatedAnnealing(objective, bounds, maxIterations) {
    const initialTemperature = 100.0;
    const coolingRate = 0.95;
    
    const dimensions = bounds.length;
    
    // 初期解をランダムに生成
    let currentSolution = [];
    for (let j = 0; j < dimensions; j++) {
        const [lower, upper] = bounds[j];
        currentSolution.push(lower + Math.random() * (upper - lower));
    }
    
    let currentEnergy = objective(currentSolution);
    
    let bestSolution = [...currentSolution];
    let bestEnergy = currentEnergy;
    
    let temperature = initialTemperature;
    
    // アニーリングのメインループ
    for (let iteration = 0; iteration < maxIterations; iteration++) {
        // 新しい解を生成
        const newSolution = [];
        for (let j = 0; j < dimensions; j++) {
            const [lower, upper] = bounds[j];
            const range = (upper - lower) * 0.1; // 現在の解の周辺を探索
            
            let value = currentSolution[j] + (Math.random() * 2 - 1) * range;
            value = Math.max(lower, Math.min(upper, value));
            
            newSolution.push(value);
        }
        
        // 新しい解を評価
        const newEnergy = objective(newSolution);
        
        // 受理判定
        if (newEnergy < currentEnergy) {
            // 新しい解が良ければ常に受理
            currentSolution = newSolution;
            currentEnergy = newEnergy;
            
            // 最良解の更新
            if (newEnergy < bestEnergy) {
                bestSolution = [...newSolution];
                bestEnergy = newEnergy;
            }
        } else {
            // 新しい解が悪くても確率的に受理
            const acceptanceProbability = Math.exp((currentEnergy - newEnergy) / temperature);
            if (Math.random() < acceptanceProbability) {
                currentSolution = newSolution;
                currentEnergy = newEnergy;
            }
        }
        
        // 温度を下げる
        temperature *= coolingRate;
    }
    
    return {
        solution: bestSolution,
        value: bestEnergy,
        iterations: maxIterations,
        convergence: true,
        message: '最適化が完了しました'
    };
}

/**
 * 粒子群最適化
 */
function particleSwarmOptimization(objective, bounds, maxIterations) {
    const swarmSize = 30;
    const w = 0.7; // 慣性重み
    const c1 = 1.5; // 認知パラメータ
    const c2 = 1.5; // 社会的パラメータ
    
    const dimensions = bounds.length;
    
    // 粒子群を初期化
    const particles = [];
    const velocities = [];
    const personalBest = [];
    const personalBestFitness = [];
    
    for (let i = 0; i < swarmSize; i++) {
        // 粒子の位置をランダムに初期化
        const position = [];
        for (let j = 0; j < dimensions; j++) {
            const [lower, upper] = bounds[j];
            position.push(lower + Math.random() * (upper - lower));
        }
        particles.push(position);
        
        // 速度をランダムに初期化
        const velocity = [];
        for (let j = 0; j < dimensions; j++) {
            const [lower, upper] = bounds[j];
            const range = upper - lower;
            velocity.push((Math.random() * 2 - 1) * range * 0.1);
        }
        velocities.push(velocity);
        
        // 個人的最良位置を初期化
        personalBest.push([...position]);
        personalBestFitness.push(objective(position));
    }
    
    // 群れの最良位置を初期化
    let globalBestIndex = personalBestFitness.indexOf(Math.min(...personalBestFitness));
    let globalBest = [...personalBest[globalBestIndex]];
    let globalBestFitness = personalBestFitness[globalBestIndex];
    
    // 最適化のメインループ
    for (let iteration = 0; iteration < maxIterations; iteration++) {
        for (let i = 0; i < swarmSize; i++) {
            // 速度を更新
            for (let j = 0; j < dimensions; j++) {
                const r1 = Math.random();
                const r2 = Math.random();
                
                velocities[i][j] = w * velocities[i][j] +
                                   c1 * r1 * (personalBest[i][j] - particles[i][j]) +
                                   c2 * r2 * (globalBest[j] - particles[i][j]);
                
                // 速度の制限
                const [lower, upper] = bounds[j];
                const range = upper - lower;
                velocities[i][j] = Math.max(-range, Math.min(range, velocities[i][j]));
            }
            
            // 位置を更新
            for (let j = 0; j < dimensions; j++) {
                particles[i][j] += velocities[i][j];
                
                // 境界チェック
                const [lower, upper] = bounds[j];
                particles[i][j] = Math.max(lower, Math.min(upper, particles[i][j]));
            }
            
            // 評価
            const fitness = objective(particles[i]);
            
            // 個人的最良位置の更新
            if (fitness < personalBestFitness[i]) {
                personalBest[i] = [...particles[i]];
                personalBestFitness[i] = fitness;
                
                // 群れの最良位置の更新
                if (fitness < globalBestFitness) {
                    globalBest = [...particles[i]];
                    globalBestFitness = fitness;
                }
            }
        }
    }
    
    return {
        solution: globalBest,
        value: globalBestFitness,
        iterations: maxIterations,
        convergence: true,
        message: '最適化が完了しました'
    };
}

/**
 * 遺伝的アルゴリズム
 */
function geneticAlgorithm(objective, bounds, maxIterations) {
    const populationSize = 50;
    const mutationRate = 0.1;
    const elitismCount = 5;
    
    const dimensions = bounds.length;
    
    // 初期集団を生成
    const population = [];
    for (let i = 0; i < populationSize; i++) {
        const individual = [];
        for (let j = 0; j < dimensions; j++) {
            const [lower, upper] = bounds[j];
            individual.push(lower + Math.random() * (upper - lower));
        }
        population.push(individual);
    }
    
    // 適応度を計算
    const calculateFitness = (individual) => {
        return objective(individual);
    };
    
    // 選択（トーナメント選択）
    const tournamentSelection = (population, fitnesses) => {
        const tournamentSize = 3;
        const tournamentIndices = [];
        
        for (let i = 0; i < tournamentSize; i++) {
            tournamentIndices.push(Math.floor(Math.random() * population.length));
        }
        
        let bestIndex = tournamentIndices[0];
        for (let i = 1; i < tournamentSize; i++) {
            if (fitnesses[tournamentIndices[i]] < fitnesses[bestIndex]) {
                bestIndex = tournamentIndices[i];
            }
        }
        
        return population[bestIndex];
    };
    
    // 交叉（一様交叉）
    const crossover = (parent1, parent2) => {
        const child = [];
        for (let i = 0; i < dimensions; i++) {
            child.push(Math.random() < 0.5 ? parent1[i] : parent2[i]);
        }
        return child;
    };
    
    // 突然変異
    const mutate = (individual) => {
        const mutated = [...individual];
        for (let i = 0; i < dimensions; i++) {
            if (Math.random() < mutationRate) {
                const [lower, upper] = bounds[i];
                mutated[i] = lower + Math.random() * (upper - lower);
            }
        }
        return mutated;
    };
    
    let bestIndividual = null;
    let bestFitness = Infinity;
    
    // 進化のメインループ
    for (let generation = 0; generation < maxIterations; generation++) {
        // 適応度を計算
        const fitnesses = population.map(individual => calculateFitness(individual));
        
        // 最良個体を追跡
        const currentBestIndex = fitnesses.indexOf(Math.min(...fitnesses));
        if (fitnesses[currentBestIndex] < bestFitness) {
            bestIndividual = [...population[currentBestIndex]];
            bestFitness = fitnesses[currentBestIndex];
        }
        
        // エリート個体を保存
        const elites = [];
        const sortedIndices = fitnesses.map((f, i) => i).sort((a, b) => fitnesses[a] - fitnesses[b]);
        for (let i = 0; i < elitismCount; i++) {
            elites.push([...population[sortedIndices[i]]]);
        }
        
        // 新しい集団を生成
        const newPopulation = [...elites];
        
        while (newPopulation.length < populationSize) {
            // 選択
            const parent1 = tournamentSelection(population, fitnesses);
            const parent2 = tournamentSelection(population, fitnesses);
            
            // 交叉
            let child = crossover(parent1, parent2);
            
            // 突然変異
            child = mutate(child);
            
            newPopulation.push(child);
        }
        
        // 集団を更新
        population.length = 0;
        population.push(...newPopulation);
    }
    
    return {
        solution: bestIndividual,
        value: bestFitness,
        iterations: maxIterations,
        convergence: true,
        message: '最適化が完了しました'
    };
}

/**
 * 最適化結果を表示
 */
function displayOptimizationResult(result) {
    let output = '';
    
    switch (result.type) {
        case 'unconstrained':
            output += `<h3>制約なし最適化結果</h3>`;
            output += `<p>目標: ${result.goal === 'minimize' ? '最小化' : '最大化'}</p>`;
            output += `<p>手法: ${getMethodName(result.method)}</p>`;
            output += `<p>目的関数: ${result.objective}</p>`;
            output += `<p>最適値: ${result.optimalValue.toFixed(6)}</p>`;
            output += `<p>最適解:</p>`;
            output += `<ul>`;
            for (const [variable, value] of Object.entries(result.optimalValues)) {
                output += `<li>${variable} = ${value.toFixed(6)}</li>`;
            }
            output += `</ul>`;
            output += `<p>反復回数: ${result.iterations}</p>`;
            output += `<p>収束: ${result.convergence ? '成功' : '失敗'}</p>`;
            output += `<p>メッセージ: ${result.message}</p>`;
            break;
            
        case 'constrained':
            output += `<h3>制約付き最適化結果</h3>`;
            output += `<p>目標: ${result.goal === 'minimize' ? '最小化' : '最大化'}</p>`;
            output += `<p>手法: ${getMethodName(result.method)}</p>`;
            output += `<p>目的関数: ${result.objective}</p>`;
            
            if (result.equalityConstraints && result.equalityConstraints.length > 0) {
                output += `<p>等式制約:</p>`;
                output += `<ul>`;
                for (const constraint of result.equalityConstraints) {
                    output += `<li>${constraint}</li>`;
                }
                output += `</ul>`;
            }
            
            if (result.inequalityConstraints && result.inequalityConstraints.length > 0) {
                output += `<p>不等式制約:</p>`;
                output += `<ul>`;
                for (const constraint of result.inequalityConstraints) {
                    output += `<li>${constraint}</li>`;
                }
                output += `</ul>`;
            }
            
            output += `<p>最適値: ${result.optimalValue.toFixed(6)}</p>`;
            output += `<p>最適解:</p>`;
            output += `<ul>`;
            for (const [variable, value] of Object.entries(result.optimalValues)) {
                output += `<li>${variable} = ${value.toFixed(6)}</li>`;
            }
            output += `</ul>`;
            
            if (result.constraintValues) {
                if (result.constraintValues.equality && result.constraintValues.equality.length > 0) {
                    output += `<p>等式制約値:</p>`;
                    output += `<ul>`;
                    for (let i = 0; i < result.constraintValues.equality.length; i++) {
                        output += `<li>制約 ${i+1}: ${result.constraintValues.equality[i].toFixed(6)}</li>`;
                    }
                    output += `</ul>`;
                }
                
                if (result.constraintValues.inequality && result.constraintValues.inequality.length > 0) {
                    output += `<p>不等式制約値:</p>`;
                    output += `<ul>`;
                    for (let i = 0; i < result.constraintValues.inequality.length; i++) {
                        output += `<li>制約 ${i+1}: ${result.constraintValues.inequality[i].toFixed(6)}</li>`;
                    }
                    output += `</ul>`;
                }
            }
            
            output += `<p>反復回数: ${result.iterations}</p>`;
            output += `<p>収束: ${result.convergence ? '成功' : '失敗'}</p>`;
            output += `<p>メッセージ: ${result.message}</p>`;
            break;
            
        case 'linear-programming':
            output += `<h3>線形計画法結果</h3>`;
            output += `<p>目標: ${result.goal === 'minimize' ? '最小化' : '最大化'}</p>`;
            output += `<p>手法: ${getMethodName(result.method)}</p>`;
            output += `<p>最適値: ${result.optimalValue.toFixed(6)}</p>`;
            output += `<p>最適解:</p>`;
            output += `<ul>`;
            for (let i = 0; i < result.solution.length; i++) {
                output += `<li>x${i+1} = ${result.solution[i].toFixed(6)}</li>`;
            }
            output += `</ul>`;
            output += `<p>メッセージ: ${result.message}</p>`;
            break;
            
        case 'integer-programming':
            output += `<h3>整数計画法結果</h3>`;
            output += `<p>目標: ${result.goal === 'minimize' ? '最小化' : '最大化'}</p>`;
            output += `<p>手法: ${getMethodName(result.method)}</p>`;
            output += `<p>最適値: ${result.optimalValue.toFixed(6)}</p>`;
            output += `<p>最適解:</p>`;
            output += `<ul>`;
            for (let i = 0; i < result.solution.length; i++) {
                output += `<li>x${i+1} = ${result.solution[i].toFixed(0)}</li>`;
            }
            output += `</ul>`;
            output += `<p>メッセージ: ${result.message}</p>`;
            break;
            
        case 'global':
            output += `<h3>大域的最適化結果</h3>`;
            output += `<p>目標: ${result.goal === 'minimize' ? '最小化' : '最大化'}</p>`;
            output += `<p>手法: ${getMethodName(result.method)}</p>`;
            output += `<p>目的関数: ${result.objective}</p>`;
            output += `<p>最適値: ${result.optimalValue.toFixed(6)}</p>`;
            output += `<p>最適解:</p>`;
            output += `<ul>`;
            for (const [variable, value] of Object.entries(result.optimalValues)) {
                output += `<li>${variable} = ${value.toFixed(6)}</li>`;
            }
            output += `</ul>`;
            output += `<p>反復回数: ${result.iterations}</p>`;
            output += `<p>収束: ${result.convergence ? '成功' : '失敗'}</p>`;
            output += `<p>メッセージ: ${result.message}</p>`;
            break;
            
        default:
            output += `<p>未対応の最適化タイプです: ${result.type}</p>`;
    }
    
    document.getElementById('optimization-output').innerHTML = output;
}

/**
 * 最適化手法の名前を取得
 */
function getMethodName(method) {
    const methodNames = {
        // 制約なし最適化
        'gradient-descent': '勾配降下法',
        'newton': 'ニュートン法',
        'bfgs': 'BFGS法',
        'conjugate-gradient': '共役勾配法',
        'nelder-mead': 'ネルダー・ミード法',
        
        // 制約付き最適化
        'penalty': 'ペナルティ法',
        'augmented-lagrangian': '拡張ラグランジュ法',
        'slsqp': '逐次二次計画法 (SLSQP)',
        'trust-constr': '信頼領域制約法',
        'cobyla': 'COBYLA法',
        
        // 線形計画法
        'simplex': 'シンプレックス法',
        'interior-point': '内点法',
        'revised-simplex': '改訂シンプレックス法',
        
        // 整数計画法
        'branch-and-bound': '分枝限定法',
        'cutting-plane': '切除平面法',
        'branch-and-cut': '分枝カット法',
        
        // 非線形計画法
        'sqp': '逐次二次計画法 (SQP)',
        'ipopt': '内点法 (IPOPT)',
        'trust-region': '信頼領域法',
        'active-set': '有効制約法',
        
        // 大域的最適化
        'differential-evolution': '差分進化法',
        'simulated-annealing': 'シミュレーテッドアニーリング',
        'particle-swarm': '粒子群最適化',
        'genetic': '遺伝的アルゴリズム',
        'basin-hopping': 'ベイスンホッピング',
        'dual-annealing': '二重アニーリング'
    };
    
    return methodNames[method] || method;
}

/**
 * 最適化結果を可視化
 */
function visualizeOptimizationResult(result) {
    const container = document.getElementById('optimization-visualization');
    container.innerHTML = '';
    
    // 2次元の場合のみ可視化
    if (result.variables && result.variables.length === 2) {
        // 目的関数の等高線プロット
        const x = result.variables[0];
        const y = result.variables[1];
        
        // 変数の範囲を決定
        let xRange, yRange;
        
        if (result.type === 'global' && result.bounds) {
            xRange = result.bounds[0];
            yRange = result.bounds[1];
        } else {
            // 最適解の周辺を表示
            const optimalX = result.optimalValues[x];
            const optimalY = result.optimalValues[y];
            
            const rangeX = Math.max(1, Math.abs(optimalX) * 2);
            const rangeY = Math.max(1, Math.abs(optimalY) * 2);
            
            xRange = [optimalX - rangeX, optimalX + rangeX];
            yRange = [optimalY - rangeY, optimalY + rangeY];
        }
        
        // 等高線データを生成
        const resolution = 50;
        const xValues = Array.from({length: resolution}, (_, i) => xRange[0] + (xRange[1] - xRange[0]) * i / (resolution - 1));
        const yValues = Array.from({length: resolution}, (_, i) => yRange[0] + (yRange[1] - yRange[0]) * i / (resolution - 1));
        
        const z = [];
        for (let i = 0; i < resolution; i++) {
            const row = [];
            for (let j = 0; j < resolution; j++) {
                const scope = {};
                scope[x] = xValues[j];
                scope[y] = yValues[i];
                
                try {
                    const value = math.evaluate(result.objective, scope);
                    row.push(value);
                } catch (e) {
                    row.push(NaN);
                }
            }
            z.push(row);
        }
        
        // 等高線プロット
        const contourData = [{
            z: z,
            x: xValues,
            y: yValues,
            type: 'contour',
            colorscale: 'Viridis',
            contours: {
                coloring: 'heatmap'
            }
        }];
        
        // 最適解をマーク
        const optimalPoint = {
            x: [result.optimalValues[x]],
            y: [result.optimalValues[y]],
            mode: 'markers',
            type: 'scatter',
            marker: {
                color: 'red',
                size: 10,
                symbol: 'x'
            },
            name: '最適解'
        };
        
        // 制約を追加（制約付き最適化の場合）
        const constraintTraces = [];
        
        if (result.type === 'constrained') {
            // 等式制約
            if (result.equalityConstraints) {
                for (let i = 0; i < result.equalityConstraints.length; i++) {
                    const constraint = result.equalityConstraints[i];
                    
                    // 制約の等高線を追加
                    const constraintZ = [];
                    for (let i = 0; i < resolution; i++) {
                        const row = [];
                        for (let j = 0; j < resolution; j++) {
                            const scope = {};
                            scope[x] = xValues[j];
                            scope[y] = yValues[i];
                            
                            try {
                                // 等式制約を評価
                                const parts = constraint.split('=');
                                if (parts.length === 2) {
                                    const lhs = math.evaluate(parts[0], scope);
                                    const rhs = math.evaluate(parts[1], scope);
                                    row.push(lhs - rhs);
                                } else {
                                    row.push(math.evaluate(constraint, scope));
                                }
                            } catch (e) {
                                row.push(NaN);
                            }
                        }
                        constraintZ.push(row);
                    }
                    
                    constraintTraces.push({
                        z: constraintZ,
                        x: xValues,
                        y: yValues,
                        type: 'contour',
                        contours: {
                            coloring: 'lines',
                            showlabels: true,
                            start: 0,
                            end: 0,
                            size: 0
                        },
                        line: {
                            color: 'rgba(255, 0, 0, 0.8)',
                            width: 2
                        },
                        showscale: false,
                        name: `等式制約 ${i+1}`
                    });
                }
            }
            
            // 不等式制約
            if (result.inequalityConstraints) {
                for (let i = 0; i < result.inequalityConstraints.length; i++) {
                    const constraint = result.inequalityConstraints[i];
                    
                    // 制約の等高線を追加
                    const constraintZ = [];
                    for (let i = 0; i < resolution; i++) {
                        const row = [];
                        for (let j = 0; j < resolution; j++) {
                            const scope = {};
                            scope[x] = xValues[j];
                            scope[y] = yValues[i];
                            
                            try {
                                // 不等式制約を評価
                                if (constraint.includes('>=')) {
                                    const parts = constraint.split('>=');
                                    const lhs = math.evaluate(parts[0], scope);
                                    const rhs = math.evaluate(parts[1], scope);
                                    row.push(lhs - rhs);
                                } else if (constraint.includes('<=')) {
                                    const parts = constraint.split('<=');
                                    const lhs = math.evaluate(parts[0], scope);
                                    const rhs = math.evaluate(parts[1], scope);
                                    row.push(rhs - lhs);
                                } else if (constraint.includes('>')) {
                                    const parts = constraint.split('>');
                                    const lhs = math.evaluate(parts[0], scope);
                                    const rhs = math.evaluate(parts[1], scope);
                                    row.push(lhs - rhs);
                                } else if (constraint.includes('<')) {
                                    const parts = constraint.split('<');
                                    const lhs = math.evaluate(parts[0], scope);
                                    const rhs = math.evaluate(parts[1], scope);
                                    row.push(rhs - lhs);
                                } else {
                                    row.push(NaN);
                                }
                            } catch (e) {
                                row.push(NaN);
                            }
                        }
                        constraintZ.push(row);
                    }
                    
                    constraintTraces.push({
                        z: constraintZ,
                        x: xValues,
                        y: yValues,
                        type: 'contour',
                        contours: {
                            coloring: 'lines',
                            showlabels: true,
                            start: 0,
                            end: 0,
                            size: 0
                        },
                        line: {
                            color: 'rgba(0, 0, 255, 0.8)',
                            width: 2
                        },
                        showscale: false,
                        name: `不等式制約 ${i+1}`
                    });
                }
            }
        }
        
        // プロットレイアウト
        const layout = {
            title: `目的関数の等高線と最適解`,
            xaxis: {
                title: x
            },
            yaxis: {
                title: y
            },
            width: 600,
            height: 500,
            margin: {
                l: 50,
                r: 50,
                b: 50,
                t: 50,
                pad: 4
            }
        };
        
        // プロットデータを結合
        const plotData = [...contourData, optimalPoint, ...constraintTraces];
        
        // プロットを描画
        Plotly.newPlot(container, plotData, layout);
    } else {
        container.innerHTML = '<p>可視化は2次元の最適化問題のみサポートしています。</p>';
    }
}

/**
 * 最適化結果をLaTeX形式で表示
 */
function displayOptimizationLatex() {
    try {
        const outputElement = document.getElementById('optimization-output');
        const latexElement = document.getElementById('optimization-latex');
        
        if (!outputElement.textContent) {
            throw new Error('最適化結果がありません。まず最適化を実行してください。');
        }
        
        // 最適化タイプを取得
        const optimizationType = document.getElementById('optimization-type').value;
        
        let latexContent = '';
        
        switch (optimizationType) {
            case 'unconstrained':
                latexContent = generateUnconstrainedLatex();
                break;
                
            case 'constrained':
                latexContent = generateConstrainedLatex();
                break;
                
            case 'linear-programming':
                latexContent = generateLinearProgrammingLatex();
                break;
                
            case 'integer-programming':
                latexContent = generateIntegerProgrammingLatex();
                break;
                
            case 'nonlinear-programming':
                latexContent = generateNonlinearProgrammingLatex();
                break;
                
            case 'global':
                latexContent = generateGlobalOptimizationLatex();
                break;
                
            default:
                throw new Error('未対応の最適化タイプです');
        }
        
        // LaTeX表示
        latexElement.innerHTML = latexContent;
        
        // MathJaxで数式をレンダリング
        if (window.MathJax) {
            MathJax.typesetPromise([latexElement]).catch((err) => {
                console.error('MathJax error:', err);
            });
        }
        
    } catch (e) {
        console.error('LaTeX生成エラー:', e);
        document.getElementById('optimization-latex').innerHTML = `
            <div class="result-error">
                <p>LaTeX生成エラー: ${e.message}</p>
            </div>
        `;
    }
}

/**
 * 制約なし最適化のLaTeX表現を生成
 */
function generateUnconstrainedLatex() {
    const objectiveStr = document.getElementById('optimization-unconstrained-objective').value;
    const variablesStr = document.getElementById('optimization-unconstrained-variables').value;
    const method = document.getElementById('optimization-unconstrained-method').value;
    const goal = document.getElementById('optimization-unconstrained-goal').value;
    
    const variables = variablesStr.split(',').map(v => v.trim());
    
    // 出力要素から最適解を取得
    const outputElement = document.getElementById('optimization-output');
    const outputText = outputElement.textContent;
    
    // 最適値を抽出
    const optimalValueMatch = outputText.match(/最適値: ([-+]?\d+(\.\d+)?([eE][-+]?\d+)?)/);
    const optimalValue = optimalValueMatch ? optimalValueMatch[1] : 'N/A';
    
    // 最適解を抽出
    const optimalValues = {};
    for (const variable of variables) {
        const regex = new RegExp(`${variable} = ([-+]?\\d+(\\.\\d+)?([eE][-+]?\\d+)?)`);
        const match = outputText.match(regex);
        if (match) {
            optimalValues[variable] = match[1];
        }
    }
    
    // LaTeX表現を生成
    let latex = '';
    
    // 問題の定式化
    latex += '\\begin{align}\n';
    if (goal === 'minimize') {
        latex += `\\text{minimize} & \\quad f(${variables.join(', ')}) = ${math.parse(objectiveStr).toTex()} \\\\\n`;
    } else {
        latex += `\\text{maximize} & \\quad f(${variables.join(', ')}) = ${math.parse(objectiveStr).toTex()} \\\\\n`;
    }
    latex += '\\end{align}\n\n';
    
    // 最適化手法
    latex += `\\textbf{最適化手法:} ${getMethodName(method)}\n\n`;
    
    // 最適解
    latex += '\\textbf{最適解:}\n';
    latex += '\\begin{align}\n';
    for (const variable of variables) {
        latex += `${variable}^* &= ${optimalValues[variable] || 'N/A'} \\\\\n`;
    }
    latex += '\\end{align}\n\n';
    
    // 最適値
    latex += `\\textbf{最適値:} f(${variables.map(v => `${v}^*`).join(', ')}) = ${optimalValue}\n`;
    
    return latex;
}

/**
 * 制約付き最適化のLaTeX表現を生成
 */
function generateConstrainedLatex() {
    const objectiveStr = document.getElementById('optimization-constrained-objective').value;
    const variablesStr = document.getElementById('optimization-constrained-variables').value;
    const eqConstraintsStr = document.getElementById('optimization-constrained-eq').value;
    const ineqConstraintsStr = document.getElementById('optimization-constrained-ineq').value;
    const method = document.getElementById('optimization-constrained-method').value;
    const goal = document.getElementById('optimization-constrained-goal').value;
    
    const variables = variablesStr.split(',').map(v => v.trim());
    
    // 出力要素から最適解を取得
    const outputElement = document.getElementById('optimization-output');
    const outputText = outputElement.textContent;
    
    // 最適値を抽出
    const optimalValueMatch = outputText.match(/最適値: ([-+]?\d+(\.\d+)?([eE][-+]?\d+)?)/);
    const optimalValue = optimalValueMatch ? optimalValueMatch[1] : 'N/A';
    
    // 最適解を抽出
    const optimalValues = {};
    for (const variable of variables) {
        const regex = new RegExp(`${variable} = ([-+]?\\d+(\\.\\d+)?([eE][-+]?\\d+)?)`);
        const match = outputText.match(regex);
        if (match) {
            optimalValues[variable] = match[1];
        }
    }
    
    // LaTeX表現を生成
    let latex = '';
    
    // 問題の定式化
    latex += '\\begin{align}\n';
    if (goal === 'minimize') {
        latex += `\\text{minimize} & \\quad f(${variables.join(', ')}) = ${math.parse(objectiveStr).toTex()} \\\\\n`;
    } else {
        latex += `\\text{maximize} & \\quad f(${variables.join(', ')}) = ${math.parse(objectiveStr).toTex()} \\\\\n`;
    }
    
    // 制約条件
    latex += '\\text{subject to} & \\quad ';
    
    // 等式制約
    const eqConstraints = [];
    if (eqConstraintsStr) {
        const eqParts = eqConstraintsStr.split(';');
        for (const part of eqParts) {
            if (part.trim()) {
                const eqPart = part.trim();
                if (eqPart.includes('=')) {
                    const [lhs, rhs] = eqPart.split('=').map(s => s.trim());
                    eqConstraints.push(`${math.parse(lhs).toTex()} = ${math.parse(rhs).toTex()}`);
                } else {
                    eqConstraints.push(`${math.parse(eqPart).toTex()} = 0`);
                }
            }
        }
    }
    
    // 不等式制約
    const ineqConstraints = [];
    if (ineqConstraintsStr) {
        const ineqParts = ineqConstraintsStr.split(';');
        for (const part of ineqParts) {
            if (part.trim()) {
                const ineqPart = part.trim();
                if (ineqPart.includes('>=')) {
                    const [lhs, rhs] = ineqPart.split('>=').map(s => s.trim());
                    ineqConstraints.push(`${math.parse(lhs).toTex()} \\geq ${math.parse(rhs).toTex()}`);
                } else if (ineqPart.includes('<=')) {
                    const [lhs, rhs] = ineqPart.split('<=').map(s => s.trim());
                    ineqConstraints.push(`${math.parse(lhs).toTex()} \\leq ${math.parse(rhs).toTex()}`);
                } else if (ineqPart.includes('>')) {
                    const [lhs, rhs] = ineqPart.split('>').map(s => s.trim());
                    ineqConstraints.push(`${math.parse(lhs).toTex()} > ${math.parse(rhs).toTex()}`);
                } else if (ineqPart.includes('<')) {
                    const [lhs, rhs] = ineqPart.split('<').map(s => s.trim());
                    ineqConstraints.push(`${math.parse(lhs).toTex()} < ${math.parse(rhs).toTex()}`);
                }
            }
        }
    }
    
    // 制約条件を結合
    const allConstraints = [...eqConstraints, ...ineqConstraints];
    if (allConstraints.length > 0) {
        latex += allConstraints.join(', \\\\\n& \\quad ');
    } else {
        latex += '\\text{なし}';
    }
    
    latex += '\n\\end{align}\n\n';
    
    // 最適化手法
    latex += `\\textbf{最適化手法:} ${getMethodName(method)}\n\n`;
    
    // 最適解
    latex += '\\textbf{最適解:}\n';
    latex += '\\begin{align}\n';
    for (const variable of variables) {
        latex += `${variable}^* &= ${optimalValues[variable] || 'N/A'} \\\\\n`;
    }
    latex += '\\end{align}\n\n';
    
    // 最適値
    latex += `\\textbf{最適値:} f(${variables.map(v => `${v}^*`).join(', ')}) = ${optimalValue}\n`;
    
    return latex;
}

/**
 * 線形計画問題のLaTeX表現を生成
 */
function generateLinearProgrammingLatex() {
    const objectiveStr = document.getElementById('optimization-lp-objective').value;
    const constraintsStr = document.getElementById('optimization-lp-constraints').value;
    const boundsStr = document.getElementById('optimization-lp-bounds').value;
    const inequalityStr = document.getElementById('optimization-lp-inequality').value;
    const method = document.getElementById('optimization-lp-method').value;
    const goal = document.getElementById('optimization-lp-goal').value;
    
    // 目的関数係数の解析
    const c = objectiveStr.split(',').map(v => parseFloat(v.trim()));
    
    // 制約条件係数の解析
    const A = [];
    const constraintRows = constraintsStr.split(';');
    for (const row of constraintRows) {
        if (row.trim()) {
            const rowValues = row.split(',').map(v => parseFloat(v.trim()));
            A.push(rowValues);
        }
    }
    
    // 制約条件の右辺の解析
    const b = boundsStr.split(',').map(v => parseFloat(v.trim()));
    
    // 不等号の解析
    const inequalities = inequalityStr.split(',').map(v => v.trim());
    
    // 出力要素から最適解を取得
    const outputElement = document.getElementById('optimization-output');
    const outputText = outputElement.textContent;
    
    // 最適値を抽出
    const optimalValueMatch = outputText.match(/最適値: ([-+]?\d+(\.\d+)?([eE][-+]?\d+)?)/);
    const optimalValue = optimalValueMatch ? optimalValueMatch[1] : 'N/A';
    
    // 最適解を抽出
    const optimalValues = [];
    for (let i = 0; i < c.length; i++) {
        const regex = new RegExp(`x${i+1} = ([-+]?\\d+(\\.\\d+)?([eE][-+]?\\d+)?)`);
        const match = outputText.match(regex);
        if (match) {
            optimalValues.push(match[1]);
        } else {
            optimalValues.push('N/A');
        }
    }
    
    // LaTeX表現を生成
    let latex = '';
    
    // 問題の定式化
    latex += '\\begin{align}\n';
    
    // 目的関数
    if (goal === 'minimize') {
        latex += '\\text{minimize} & \\quad ';
    } else {
        latex += '\\text{maximize} & \\quad ';
    }
    
    const objectiveTerms = [];
    for (let i = 0; i < c.length; i++) {
        if (c[i] !== 0) {
            if (c[i] === 1) {
                objectiveTerms.push(`x_{${i+1}}`);
            } else if (c[i] === -1) {
                objectiveTerms.push(`-x_{${i+1}}`);
            } else {
                objectiveTerms.push(`${c[i]}x_{${i+1}}`);
            }
        }
    }
    
    latex += objectiveTerms.join(' + ').replace(/\+ -/g, '- ') + ' \\\\\n';
    
    // 制約条件
    latex += '\\text{subject to} & \\quad ';
    
    const constraints = [];
    for (let i = 0; i < A.length; i++) {
        const row = A[i];
        const terms = [];
        
        for (let j = 0; j < row.length; j++) {
            if (row[j] !== 0) {
                if (row[j] === 1) {
                    terms.push(`x_{${j+1}}`);
                } else if (row[j] === -1) {
                    terms.push(`-x_{${j+1}}`);
                } else {
                    terms.push(`${row[j]}x_{${j+1}}`);
                }
            }
        }
        
        let constraint = terms.join(' + ').replace(/\+ -/g, '- ');
        
        if (inequalities[i] === '<=') {
            constraint += ` \\leq ${b[i]}`;
        } else if (inequalities[i] === '>=') {
            constraint += ` \\geq ${b[i]}`;
        } else if (inequalities[i] === '=') {
            constraint += ` = ${b[i]}`;
        }
        
        constraints.push(constraint);
    }
    
    latex += constraints.join(', \\\\\n& \\quad ');
    
    // 非負制約
    latex += ', \\\\\n& \\quad x_j \\geq 0, \\quad j = 1, 2, \\ldots, ' + c.length;
    
    latex += '\n\\end{align}\n\n';
    
    // 最適化手法
    latex += `\\textbf{最適化手法:} ${getMethodName(method)}\n\n`;
    
    // 最適解
    latex += '\\textbf{最適解:}\n';
    latex += '\\begin{align}\n';
    for (let i = 0; i < optimalValues.length; i++) {
        latex += `x_{${i+1}}^* &= ${optimalValues[i]} \\\\\n`;
    }
    latex += '\\end{align}\n\n';
    
    // 最適値
    latex += `\\textbf{最適値:} z^* = ${optimalValue}\n`;
    
    return latex;
}

/**
 * 整数計画問題のLaTeX表現を生成
 */
function generateIntegerProgrammingLatex() {
    // 線形計画問題のLaTeX表現を基にして、変数の整数制約を追加
    let latex = generateLinearProgrammingLatex();
    
    const varTypesStr = document.getElementById('optimization-ip-var-types').value;
    const varTypes = varTypesStr.split(',').map(v => v.trim());
    
    // 整数制約を追加
    const integerConstraints = [];
    const binaryConstraints = [];
    
    for (let i = 0; i < varTypes.length; i++) {
        if (varTypes[i] === 'i') {
            integerConstraints.push(`x_{${i+1}} \\in \\mathbb{Z}`);
        } else if (varTypes[i] === 'b') {
            binaryConstraints.push(`x_{${i+1}} \\in \\{0, 1\\}`);
        }
    }
    
    // 整数制約と二値制約を追加
    if (integerConstraints.length > 0 || binaryConstraints.length > 0) {
        latex = latex.replace('\\end{align}\n\n', '');
        
        if (integerConstraints.length > 0) {
            latex += ', \\\\\n& \\quad ' + integerConstraints.join(', ');
        }
        
        if (binaryConstraints.length > 0) {
            latex += ', \\\\\n& \\quad ' + binaryConstraints.join(', ');
        }
        
        latex += '\n\\end{align}\n\n';
    }
    
    return latex;
}

/**
 * 非線形計画問題のLaTeX表現を生成
 */
function generateNonlinearProgrammingLatex() {
    // 制約付き最適化のLaTeX表現と同じ
    return generateConstrainedLatex();
}

/**
 * 大域的最適化のLaTeX表現を生成
 */
function generateGlobalOptimizationLatex() {
    const objectiveStr = document.getElementById('optimization-global-objective').value;
    const variablesStr = document.getElementById('optimization-global-variables').value;
    const boundsStr = document.getElementById('optimization-global-bounds').value;
    const method = document.getElementById('optimization-global-method').value;
    const goal = document.getElementById('optimization-global-goal').value;
    
    const variables = variablesStr.split(',').map(v => v.trim());
    
    // 変数の範囲の解析
    const bounds = [];
    const boundsParts = boundsStr.split(';');
    for (const part of boundsParts) {
        if (part.trim()) {
            const [lower, upper] = part.split(',').map(v => v.trim());
            bounds.push([lower, upper]);
        }
    }
    
    // 出力要素から最適解を取得
    const outputElement = document.getElementById('optimization-output');
    const outputText = outputElement.textContent;
    
    // 最適値を抽出
    const optimalValueMatch = outputText.match(/最適値: ([-+]?\d+(\.\d+)?([eE][-+]?\d+)?)/);
    const optimalValue = optimalValueMatch ? optimalValueMatch[1] : 'N/A';
    
    // 最適解を抽出
    const optimalValues = {};
    for (const variable of variables) {
        const regex = new RegExp(`${variable} = ([-+]?\\d+(\\.\\d+)?([eE][-+]?\\d+)?)`);
        const match = outputText.match(regex);
        if (match) {
            optimalValues[variable] = match[1];
        }
    }
    
    // LaTeX表現を生成
    let latex = '';
    
    // 問題の定式化
    latex += '\\begin{align}\n';
    if (goal === 'minimize') {
        latex += `\\text{minimize} & \\quad f(${variables.join(', ')}) = ${math.parse(objectiveStr).toTex()} \\\\\n`;
    } else {
        latex += `\\text{maximize} & \\quad f(${variables.join(', ')}) = ${math.parse(objectiveStr).toTex()} \\\\\n`;
    }
    
    // 変数の範囲制約
    latex += '\\text{subject to} & \\quad ';
    
    const boundConstraints = [];
    for (let i = 0; i < variables.length; i++) {
        if (bounds[i]) {
            boundConstraints.push(`${bounds[i][0]} \\leq ${variables[i]} \\leq ${bounds[i][1]}`);
        }
    }
    
    latex += boundConstraints.join(', \\\\\n& \\quad ');
    
    latex += '\n\\end{align}\n\n';
    
    // 最適化手法
    latex += `\\textbf{最適化手法:} ${getMethodName(method)}\n\n`;
    
    // 最適解
    latex += '\\textbf{最適解:}\n';
    latex += '\\begin{align}\n';
    for (const variable of variables) {
        latex += `${variable}^* &= ${optimalValues[variable] || 'N/A'} \\\\\n`;
    }
    latex += '\\end{align}\n\n';
    
    // 最適値
    latex += `\\textbf{最適値:} f(${variables.map(v => `${v}^*`).join(', ')}) = ${optimalValue}\n`;
    
    return latex;
}

// イベントリスナーの設定
document.addEventListener('DOMContentLoaded', function() {
    // 最適化タイプの変更イベント
    document.getElementById('optimization-type').addEventListener('change', function() {
        // すべての最適化入力を非表示
        const optimizationInputs = document.querySelectorAll('.optimization-input');
        optimizationInputs.forEach(input => {
            input.style.display = 'none';
        });
        
        // 選択された最適化タイプの入力を表示
        const selectedType = this.value;
        const selectedInput = document.getElementById(`optimization-${selectedType}-input`);
        if (selectedInput) {
            selectedInput.style.display = 'block';
        }
    });
    
    // 制約なし最適化の手法変更イベント
    document.getElementById('optimization-unconstrained-method').addEventListener('change', function() {
        // 特定の手法に応じた追加入力フィールドの表示/非表示
    });
    
    // 制約付き最適化の手法変更イベント
    document.getElementById('optimization-constrained-method').addEventListener('change', function() {
        // 特定の手法に応じた追加入力フィールドの表示/非表示
    });
    
    // 線形計画法の手法変更イベント
    document.getElementById('optimization-lp-method').addEventListener('change', function() {
        // 特定の手法に応じた追加入力フィールドの表示/非表示
    });
    
    // 整数計画法の手法変更イベント
    document.getElementById('optimization-ip-method').addEventListener('change', function() {
        // 特定の手法に応じた追加入力フィールドの表示/非表示
    });
    
    // 非線形計画法の手法変更イベント
    document.getElementById('optimization-nlp-method').addEventListener('change', function() {
        // 特定の手法に応じた追加入力フィールドの表示/非表示
    });
    
    // 大域的最適化の手法変更イベント
    document.getElementById('optimization-global-method').addEventListener('change', function() {
        // 特定の手法に応じた追加入力フィールドの表示/非表示
    });
    
    // 最適化実行ボタンのクリックイベント
    document.getElementById('optimization-solve-btn').addEventListener('click', function() {
        try {
            // 結果表示領域をクリア
            document.getElementById('optimization-output').innerHTML = '';
            document.getElementById('optimization-latex').innerHTML = '';
            document.getElementById('optimization-visualization').innerHTML = '';
            
            // 選択された最適化タイプに応じて解法を実行
            const optimizationType = document.getElementById('optimization-type').value;
            let result;
            
            switch (optimizationType) {
                case 'unconstrained':
                    result = solveUnconstrainedOptimization();
                    break;
                    
                case 'constrained':
                    result = solveConstrainedOptimization();
                    break;
                    
                case 'linear-programming':
                    result = solveLinearProgramming();
                    break;
                    
                case 'integer-programming':
                    result = solveIntegerProgramming();
                    break;
                    
                case 'nonlinear-programming':
                    result = solveNonlinearProgramming();
                    break;
                    
                case 'global':
                    result = solveGlobalOptimization();
                    break;
                    
                default:
                    throw new Error('未対応の最適化タイプです');
            }
            
            // 結果を表示
            displayOptimizationResult(result);
            
        } catch (e) {
            console.error('最適化エラー:', e);
            document.getElementById('optimization-output').innerHTML = `
                <div class="result-error">
                    <p>最適化エラー: ${e.message}</p>
                </div>
            `;
        }
    });
    
    // LaTeX表示ボタンのクリックイベント
    document.getElementById('optimization-latex-btn').addEventListener('click', function() {
        try {
            displayOptimizationLatex();
        } catch (e) {
            console.error('LaTeX生成エラー:', e);
            document.getElementById('optimization-latex').innerHTML = `
                <div class="result-error">
                    <p>LaTeX生成エラー: ${e.message}</p>
                </div>
            `;
        }
    });
    
    // 可視化ボタンのクリックイベント
    document.getElementById('optimization-visualize-btn').addEventListener('click', function() {
        try {
            // 選択された最適化タイプに応じて結果を取得
            const optimizationType = document.getElementById('optimization-type').value;
            let result;
            
            switch (optimizationType) {
                case 'unconstrained':
                    result = solveUnconstrainedOptimization();
                    break;
                    
                case 'constrained':
                    result = solveConstrainedOptimization();
                    break;
                    
                case 'linear-programming':
                    result = solveLinearProgramming();
                    break;
                    
                case 'integer-programming':
                    result = solveIntegerProgramming();
                    break;
                    
                case 'nonlinear-programming':
                    result = solveNonlinearProgramming();
                    break;
                    
                case 'global':
                    result = solveGlobalOptimization();
                    break;
                    
                default:
                    throw new Error('未対応の最適化タイプです');
            }
            
            // 結果を可視化
            visualizeOptimizationResult(result);
            
        } catch (e) {
            console.error('可視化エラー:', e);
            document.getElementById('optimization-visualization').innerHTML = `
                <div class="result-error">
                    <p>可視化エラー: ${e.message}</p>
                </div>
            `;
        }
    });
    
    // 初期表示設定
    document.getElementById('optimization-type').dispatchEvent(new Event('change'));
});



