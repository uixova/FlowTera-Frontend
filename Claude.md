# Proje: FlowTera Frontend

## Backend Referansı
- Backend Proje Yolu: `/home/kair3nx/Masaüstü/FlowTera-Backend/`
- Bu frontend, yukarıdaki backend dizininde tanımlı olan veri yapıları (Data Structures) ve iş mantığı ile çalışmaktadır.
- Kod yazarken veya düzenleme yaparken, backend'deki ilgili model dosyalarını mutlaka referans al.

## Çalışma Kuralları
1. Herhangi bir API veya veri yapısı değişikliğinde, önce `/home/kair3nx/Belgeler/NeuralBrain/Projects/Flowtera` dizinindeki dosyaları kontrol et.
2. Tutarsızlık sezerse, değişiklik yapmadan önce bunu kullanıcıya sor.
3. Kod yapısını backend'deki veri modelleriyle (Type/Interface tanımları) birebir uyumlu tut.

# Dosya Erişimi ve Filtreleme
- İşlem yaparken `.gitignore` dosyalarını mutlaka dikkate al.
- `node_modules`, `.git`, `.next`, `dist`, `build`, `venv`, `__pycache__` gibi dizinleri asla okuma ve bu dizinlerdeki dosyaları referans alma.
- Sadece kaynak kod dosyalarına (.ts, .tsx, .js, .py, .md) odaklan.