🧩 Ürün Tasarım Gereksinimleri (PDR) - Workshop Template

🎯 Temel Başlıklar

    Proje Adı: JetLumen
    Tür: Basit Blockchain Uygulaması (Mikro Havale Simulasyonu)
    Platform: Stellar Soroban
    Hedef: Basic frontend + basit contract entegrasyonu + testnet deployment

🎯 Proje Özeti:
    Projede, Stellar'ın hızını ve düşük maliyetini temsil eden bir "JetLumen" mikro havale uygulamasının temel işlevselliği test edilecektir. Basic ve modern görünümlü bir frontend yapılacak, daha sonrasında 2-3 fonksiyondan oluşan basit bir Soroban smart contract yazılacak ve bu hatasız şekilde frontende entegre edilecek. Bu sırada projenin modern bir görünüme sahip olması da önemli!

🚀 Kısaca Projem:
    JetLumen, sınır ötesi mikro havaleleri simüle eden minimal bir dApp'tir. Kullanıcıların XLM cinsinden bir miktar parayı (mikro meblağ) bir adresten diğerine göndermesini (transfer işleminin temelini oluşturur) veya bir bakiyeyi sorgulamasını sağlayan, yalnızca temel işlevlere sahip bir iskelet uygulamadır. Soroban contract'ı sadece bakiyeleri kaydetme/güncelleme görevini üstlenecektir.

📋 Problem Tanımı:
    Basic, modern görünümlü bir frontend arayüzü oluşturup, daha sonrasında buna uygun, çok basit bir Soroban smart contract yazıp entegre etmek. Karmaşık iş mantığı olmayan, temel blockchain işlemlerini destekleyen minimal bir uygulama ile mikro havale sürecini basitleştirilmiş bir şekilde göstermek.

✅ Yapılacaklar

    Frontend Geliştirme

        Basic ve modern görünümlü bir frontend (Next.js & Tailwind CSS ile) geliştireceğiz.
        Kullanıcıdan gönderilecek miktar ve alıcı adres bilgilerini alacak basit bir form yapısı oluşturulacak.
        Gönderme işlemi sonrası sonucu gösterecek basit bir alan olacak.
        Karmaşık yapısı olmayacak.

    Smart Contract Geliştirme (Soroban)

        Tek amaçlı, basit bir Token Bakiye Yönetimi contract'ı simülasyonu yazılacak.
        Maksimum 3-4 fonksiyon içerecek:
            initialize(): Contract'ı başlatma.
            deposit(to: Address, amount: i128): Belirtilen adrese bakiye ekleme (transfer simülasyonu için basit 
                                                bir write işlemi).
            get_balance(id: Address): Belirtilen adresin bakiyesini sorgulama (read işlemi).
            Temel blockchain işlemleri (read/write) yapılacak.
            Minimal veri saklama (sadece adres $\rightarrow$ bakiye map'i).
            Kolay test edilebilir fonksiyonlar.
    
    Frontend Entegrasyonu

        Mevcut frontend'e müdahale edilmeyecek.
        Sadece TypeScript/JavaScript entegrasyon kodları (Soroban-SDK kullanarak) eklenecek.
        Contract fonksiyonları (deposit ve get_balance) frontend'e bağlanacak.

    Wallet Bağlantısı

        Freighter Wallet API entegrasyonu.
        Basit connect/disconnect işlemleri.
        Freighter aracılığıyla imzalama (signing) işlemi entegre edilecek (özellikle deposit fonksiyonu için).
        FreighterWalletDocs.md dosyasına bakılarak bu dökümandaki bilgilerle ilerlenecek.


❌ Yapılmayacaklar (Kesinlikle)

    Contract Tarafında
        ❌ Karmaşık iş mantığı (Gerçek XLM transferi yerine sadece bakiye artırma/azaltma simülasyonu).
        ❌ Çoklu token yönetimi (Sadece tek bir XLM/token simülasyonu).
        ❌ Gelişmiş access control (Sadece basit yetkilendirme kullanılacak).
        ❌ Multi-signature işlemleri.
        ❌ Complex state management.
        ❌ Time-locked functions.
        ❌ Fee calculation logic.

    Frontend Tarafında
        ❌ Karmaşık dosya yapısı.
        ❌ Çoklu sayfa/route yapısı.


🛠 Teknik Spesifikasyonlar

    Minimal Tech Stack
        Frontend: Next.js, Tailwind CSS, TypeScript
        Contract: Rust + Soroban SDK (basic)
        Wallet: Freighter API (sadece connect/sign)
        Network: Stellar Testnet

    🧪 Test Senaryoları

        ✅ Contract başarıyla Testnet'te deploy edilebiliyor mu?
        ✅ Freighter Wallet bağlantısı (connect/disconnect) düzgün çalışıyor mu?
        ✅ Bağlanan cüzdan adresi frontend'de doğru şekilde görünüyor mu?
        ✅ get_balance (bakiye sorgulama) fonksiyonu çağrılabiliyor ve sonuç frontend'de gösteriliyor mu?
        ✅ deposit (simüle edilmiş transfer) fonksiyonu, cüzdan ile imzalanarak çağrılabiliyor mu?
        ✅ İşlem başarılı olduğunda bakiyenin (contract state'i) arttığı get_balance ile doğrulanabiliyor mu?
        ✅ Frontend'in tasarımı modern ve düzgün çalışıyor mu?

    📱 Copilot/Cursor'dan Vibe Coding sırasında uymasını istediğim ve check etmesi gereken adımlar

        Adım 1: Frontend İskeleti
            Next.js + Tailwind CSS ile minimalist, modern UI oluştur.
            Wallet bağlantı butonu ve transfer formu (Miktar, Alıcı Adres) hazırla.

        Adım 2: Contract Yazımı (Soroban Rust)
            Basit contract template oluştur.
            get_balance ve deposit fonksiyonlarını (maksimum 3-4 fonksiyon) yaz.
            Veri saklama için basit bir Map kullan.
            Contract'ı hatasız derle ve Testnet'e deploy et.

        Adım 3: Entegrasyon (TypeScript/JavaScript)
            Freighter ile wallet connection ve disconnect mantığını entegre et.
            Soroban SDK kullanarak contract'ı frontend'e bağla.
            deposit fonksiyonu çağrılırken, işlemi Freighter ile imzala (sign).
            get_balance ile güncel bakiyeyi sorgula ve sonucu gösterme.

🎯 Başarı Kriterleri

    Teknik Başarı

        ✅ Soroban Contract testnet'te başarıyla deploy edilmiş ve çalışıyor.
        ✅ Frontend, Soroban Contract entegrasyonu ile (en az deposit ve get_balance fonksiyonları) düzgün yapılmış.
        ✅ Freighter wallet ile başarılı bir şekilde connect ve işlem imzalama (sign) yapılabilmektedir.
        ✅ 3-4 fonksiyonlu basic, çalışan bir Soroban contract'a sahip olmak.
        ✅ Proje, belirlenen minimalist ve modern UI hedefine ulaşmış olmalıdır.