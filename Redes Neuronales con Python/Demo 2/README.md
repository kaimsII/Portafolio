# Diseño, Entrenamiento y Optimización Integral de una Red Neuronal con Python

## 📚 Descripción del Proyecto

Este proyecto implementa de forma **completa y unificada** todos los conceptos del **Capítulo 2: Configuración y Ejecución de Modelos Neuronales**. Es un proyecto integral que demuestra el ciclo completo de desarrollo de redes neuronales, desde el diseño de arquitecturas hasta la optimización y diagnóstico de rendimiento.

### 🎯 Objetivos

- **2.1 Ingeniería de Redes**: Diseñar y comparar 3 arquitecturas distintas
- **2.2 Protocolos de Entrenamiento**: Implementar entrenamiento con y sin controles
- **2.3 Optimización de Hiperparámetros**: Comparar Grid Search vs Random Search
- **2.4 Diagnóstico de Rendimiento**: Analizar underfitting y overfitting
- **2.5 Regularización**: Evaluar técnicas de regularización (Dropout, L1, L2)

---

## 🛠️ Requisitos del Sistema

### Software Requerido

- **Sistema Operativo**: Windows 10/11
- **Python**: 3.10 o superior
- **Memoria RAM**: Mínimo 4GB (recomendado 8GB)

### Dependencias

```
torch>=2.0.0
numpy>=1.24.0
pandas>=2.0.0
matplotlib>=3.7.0
seaborn>=0.12.0
scikit-learn>=1.3.0
```

---

## 📦 Instalación

### 1. Clonar o descargar el proyecto

```bash
cd "c:\Users\KevinDominich\1Python\Python\Personal\Portafolio\DeepLearningPython\Demo 2"
```

### 2. Instalar dependencias

```bash
python -m pip install -r neural_network_project/requirements.txt
```

### 3. Verificar instalación

```bash
python -c "import torch; print(f'PyTorch {torch.__version__} instalado correctamente')"
```

---

## 🚀 Cómo Ejecutar el Proyecto

### Ejecución Completa

Para ejecutar el proyecto completo (todos los componentes):

```bash
cd neural_network_project
python main.py
```

**⏱️ Tiempo estimado**: 10-20 minutos (dependiendo del hardware)

### Ejecución por Componentes

Si deseas ejecutar componentes individuales, puedes importar los módulos en un script de Python:

```python
from data.dataset_loader import get_data
from models.architectures import get_all_architectures
from training.trainer import NeuralNetworkTrainer

# Tu código aquí...
```

---

## 📁 Estructura del Proyecto

```
neural_network_project/
├── data/
│   └── dataset_loader.py          # Carga y preparación de datos
├── models/
│   ├── architectures.py           # 3 arquitecturas de redes neuronales
│   └── model_utils.py             # Utilidades de regularización
├── training/
│   ├── trainer.py                 # Protocolos de entrenamiento
│   ├── callbacks.py               # Early stopping, checkpoints
│   └── optimizer_search.py        # Grid/Random search
├── evaluation/
│   ├── diagnostics.py             # Diagnóstico de rendimiento
│   └── metrics.py                 # Cálculo de métricas
├── visualization/
│   └── plots.py                   # Generación de gráficos
├── checkpoints/                   # Modelos guardados
├── results/                       # Gráficos generados
├── main.py                        # Script principal
├── requirements.txt               # Dependencias
└── README.md                      # Este archivo
```

---

## 🧠 Componentes del Proyecto

### 2.1 Ingeniería de Redes

Se implementan **3 arquitecturas distintas**:

#### 1. **ShallowNet** (Red Superficial)
- **Capas**: 2 (1 hidden + 1 output)
- **Neuronas**: 64
- **Activación**: ReLU
- **Learning Rate**: 0.01
- **Batch Size**: 32

#### 2. **DeepNet** (Red Profunda)
- **Capas**: 5 (4 hidden + 1 output)
- **Neuronas**: [128, 64, 32, 16]
- **Activación**: ReLU
- **Learning Rate**: 0.001
- **Batch Size**: 64

#### 3. **RegularizedDeepNet** (Red Profunda Regularizada)
- **Capas**: 5 (4 hidden + 1 output)
- **Neuronas**: [128, 64, 32, 16]
- **Activación**: ReLU
- **Dropout**: p=0.3
- **L2 Weight Decay**: 0.001
- **Learning Rate**: 0.001
- **Batch Size**: 64

**Visualizaciones**:
- Diagramas ASCII en consola
- Diagramas gráficos con matplotlib (guardados en `results/`)

---

### 2.2 Protocolos de Entrenamiento

#### División de Datos
- **Train**: 70% (con normalización)
- **Validation**: 15%
- **Test**: 15%

#### Protocolos Implementados

1. **Entrenamiento Básico** (sin controles)
   - Entrenamiento estándar por épocas fijas
   - Sin early stopping ni checkpoints

2. **Entrenamiento con Callbacks**
   - **Early Stopping**: Detiene si validation loss no mejora (patience=10)
   - **Model Checkpoint**: Guarda mejor modelo basado en validation accuracy

3. **Reanudación desde Checkpoint**
   - Carga modelo guardado
   - Continúa entrenamiento desde último estado

**Visualizaciones**:
- Curvas de pérdida (train/val)
- Curvas de accuracy (train/val)

---

### 2.3 Optimización de Hiperparámetros

#### Espacio de Búsqueda

```python
{
    'learning_rate': [0.001, 0.01, 0.1],
    'hidden_neurons': [32, 64, 128],
    'batch_size': [32, 64]
}
```

#### Métodos Implementados

1. **Grid Search**
   - Búsqueda exhaustiva de todas las combinaciones
   - Garantiza encontrar el óptimo en el espacio definido
   - Mayor costo computacional

2. **Random Search**
   - Muestreo aleatorio de combinaciones
   - Más eficiente computacionalmente
   - Buena aproximación al óptimo

**Comparación**:
- Tiempo de ejecución
- Mejor accuracy alcanzada
- Eficiencia (accuracy/tiempo)

**Visualizaciones**:
- Gráficos de barras comparativos
- Tabla de resultados

---

### 2.4 Diagnóstico de Rendimiento

#### Análisis de Underfitting

- **Modelo**: Red muy simple (1 capa, 8 neuronas)
- **Síntomas**: Train y Val accuracy bajas (<70%)
- **Causa**: Modelo insuficiente para capturar patrones
- **Solución**: Aumentar capacidad del modelo

#### Análisis de Overfitting

- **Modelo**: Red compleja sin regularización
- **Síntomas**: Train accuracy >> Val accuracy (gap >10%)
- **Causa**: Memorización de datos de entrenamiento
- **Solución**: Aplicar regularización

#### Métricas Calculadas

- **Accuracy**: Precisión general
- **Precision**: Precisión por clase
- **Recall**: Sensibilidad por clase
- **F1-Score**: Media armónica de precision y recall
- **Confusion Matrix**: Matriz de confusión

**Visualizaciones**:
- Curvas de aprendizaje comparativas
- Matrices de confusión
- Comparación antes/después de mejoras

---

### 2.5 Regularización

#### Técnicas Implementadas

1. **Dropout** (p=0.3)
   - Desactiva aleatoriamente neuronas durante entrenamiento
   - Previene co-adaptación de features

2. **L1 Regularization** (λ=0.001)
   - Penaliza suma de valores absolutos de pesos
   - Promueve sparsity (pesos a cero)

3. **L2 Regularization** (λ=0.001)
   - Penaliza suma de cuadrados de pesos
   - Promueve pesos pequeños

#### Evaluación

- Entrenamiento de modelo base (sin regularización)
- Entrenamiento con cada técnica
- Comparación de:
  - Validation accuracy
  - Gap train-val
  - Generalización

**Visualizaciones**:
- Gráficos comparativos de curvas de aprendizaje
- Tabla de resultados

---

## 📊 Resultados Esperados

Al ejecutar el proyecto, se generarán los siguientes archivos en `results/`:

### Arquitecturas
- `arch_shallow.png`: Diagrama de ShallowNet
- `arch_deep.png`: Diagrama de DeepNet
- `arch_regularized.png`: Diagrama de RegularizedDeepNet

### Entrenamiento
- `training_basic.png`: Curvas de entrenamiento básico
- `training_callbacks.png`: Curvas con early stopping
- `training_resumed.png`: Curvas de entrenamiento reanudado

### Optimización
- `hyperparameter_search.png`: Comparación Grid vs Random Search

### Diagnóstico
- `diagnostic_comparison.png`: Underfitting vs Overfitting
- `confusion_matrix_before.png`: Matriz antes de regularización
- `confusion_matrix_after.png`: Matriz después de regularización

### Regularización
- `regularization_comparison.png`: Comparación de técnicas

---

## 🔬 Decisiones de Ingeniería

### Framework: PyTorch

**Justificación**:
- Control granular sobre arquitecturas y entrenamiento
- Flexibilidad para implementar regularización personalizada (L1)
- Excelente documentación y comunidad activa
- Mejor para propósitos educativos y experimentación

### Dataset: Sintético

**Justificación**:
- Reproducibilidad garantizada (seed fija)
- Control sobre complejidad y ruido
- No requiere descarga externa
- Permite demostrar underfitting/overfitting de forma controlada

### Hiperparámetros

**Learning Rates**:
- ShallowNet: 0.01 (modelo simple, puede usar LR mayor)
- DeepNet: 0.001 (modelo profundo, requiere LR menor para estabilidad)

**Batch Sizes**:
- ShallowNet: 32 (suficiente para modelo simple)
- DeepNet: 64 (mayor batch para mejor estimación de gradiente)

**Regularización**:
- Dropout: p=0.3 (estándar, balance entre regularización y capacidad)
- L1/L2: λ=0.001 (valor moderado, evita sobre-regularización)

---

## 🐛 Solución de Problemas

### Error: "No module named 'torch'"

**Solución**:
```bash
python -m pip install torch
```

### Error: "CUDA not available"

**Solución**: El proyecto funciona en CPU. Si deseas usar GPU, instala PyTorch con soporte CUDA desde [pytorch.org](https://pytorch.org)

### Gráficos no se generan

**Solución**: Verifica que matplotlib esté instalado:
```bash
python -m pip install matplotlib seaborn
```

### Entrenamiento muy lento

**Solución**: Reduce el número de épocas o combinaciones en Grid Search editando `main.py`

---

## 📝 Interpretación de Resultados

### Curvas de Aprendizaje

- **Convergencia**: Train y Val loss deben decrecer
- **Overfitting**: Train loss << Val loss (divergencia)
- **Underfitting**: Ambas curvas altas y planas

### Matriz de Confusión

- **Diagonal**: Predicciones correctas
- **Fuera de diagonal**: Confusiones entre clases
- **Ideal**: Valores altos en diagonal, bajos fuera

### Comparación de Regularización

- **Mejor técnica**: Mayor Val Accuracy, menor gap train-val
- **Dropout**: Generalmente mejor para redes profundas
- **L2**: Bueno para prevenir pesos grandes
- **L1**: Útil para feature selection

---

## 🎓 Conceptos Aprendidos

Este proyecto demuestra:

✅ **Diseño de arquitecturas**: Cómo el número de capas y neuronas afecta el rendimiento

✅ **Protocolos de entrenamiento**: Importancia de early stopping y checkpoints

✅ **Optimización**: Trade-off entre búsqueda exhaustiva y eficiencia

✅ **Diagnóstico**: Identificación y solución de underfitting/overfitting

✅ **Regularización**: Técnicas para mejorar generalización

---

## 📚 Referencias

- **PyTorch Documentation**: https://pytorch.org/docs/
- **Scikit-learn**: https://scikit-learn.org/
- **Deep Learning Book**: Goodfellow, Bengio, Courville

---

## 👨‍💻 Autor

Proyecto desarrollado como demostración integral del Capítulo 2: Configuración y Ejecución de Modelos Neuronales.

---

## 📄 Licencia

Este proyecto es de uso educativo.

---

## 🎉 Conclusión

Este proyecto cubre **TODOS** los temas del Capítulo 2 de forma práctica y reproducible. Cada componente está implementado, documentado y justificado. Los resultados son visualizados y comparados para facilitar el aprendizaje.

**¡Disfruta explorando el mundo de las redes neuronales!** 🚀
