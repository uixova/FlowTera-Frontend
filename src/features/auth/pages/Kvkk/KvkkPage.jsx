import React from 'react';
import { Link } from 'react-router-dom';
import '../Terms/TermsPage.css';

const LAST_UPDATED = '27 Mayıs 2026';
const COMPANY      = 'FlowTera Teknoloji A.Ş.';

const Section = ({ title, children }) => (
  <section className="legal-section">
    <h2 className="legal-section-title">{title}</h2>
    <div className="legal-section-body">{children}</div>
  </section>
);

const KvkkPage = () => {
  React.useEffect(() => {
    document.title = 'KVKK Aydınlatma Metni | FlowTera';
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="legal-page">
      <div className="legal-container">
        {/* Header */}
        <div className="legal-header">
          <Link to="/" className="legal-logo">
            <img src="/Logo.png" alt="FlowTera" width="32" height="32" />
            <span>FlowTera</span>
          </Link>
          <div className="legal-back-links">
            <Link to="/signup" className="legal-back-btn">← Kayıt Sayfasına Dön</Link>
          </div>
        </div>

        {/* Title */}
        <div className="legal-title-block">
          <h1>KVKK Aydınlatma Metni</h1>
          <p className="legal-meta">
            Son güncelleme: {LAST_UPDATED} · {COMPANY}<br />
            6698 Sayılı Kişisel Verilerin Korunması Kanunu kapsamında hazırlanmıştır.
          </p>
        </div>

        {/* Content */}
        <div className="legal-content">
          <Section title="1. Veri Sorumlusu">
            <p>
              6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca veri sorumlusu
              sıfatıyla hareket eden kuruluş: <strong>{COMPANY}</strong>.
            </p>
            <p>
              İletişim: <a href="mailto:kvkk@flowtera.app">kvkk@flowtera.app</a>
            </p>
          </Section>

          <Section title="2. İşlenen Kişisel Veriler">
            <p>FlowTera platformu aşağıdaki kişisel verileri işleyebilir:</p>
            <ul>
              <li><strong>Kimlik verileri:</strong> Ad, soyad, kullanıcı adı, doğum tarihi.</li>
              <li><strong>İletişim verileri:</strong> E-posta adresi, telefon numarası.</li>
              <li><strong>Finansal işlem verileri:</strong> Yüklenen harcama belgeleri, fatura görüntüleri, tutar bilgileri (makbuz içerikleri).</li>
              <li><strong>Konum verileri:</strong> Seyahat kayıtlarında beyan edilen şehir/ülke bilgisi.</li>
              <li><strong>Log ve teknik veriler:</strong> IP adresi, tarayıcı türü, oturum süreleri, uygulama içi aksiyonlar.</li>
              <li><strong>Ödeme verileri:</strong> Abonelik bilgileri; kredi kartı bilgileri Stripe üzerinden işlenir, FlowTera tarafından saklanmaz.</li>
            </ul>
          </Section>

          <Section title="3. İşleme Amaçları">
            <ul>
              <li>Platform hizmetinin sunulması ve kullanıcı hesabının yönetilmesi</li>
              <li>Harcama ve seyahat kayıtlarının takibi, raporlanması</li>
              <li>OCR ve AI analiziyle fatura işleme hizmetinin yerine getirilmesi</li>
              <li>Abonelik ve ödeme işlemlerinin yürütülmesi</li>
              <li>Güvenlik, doğrulama (OTP) ve erişim yönetimi</li>
              <li>Yasal yükümlülüklerin yerine getirilmesi</li>
              <li>Hizmet kalitesinin ölçülmesi ve iyileştirilmesi (anonimleştirilmiş)</li>
            </ul>
          </Section>

          <Section title="4. Hukuki Dayanak">
            <p>Verileriniz aşağıdaki hukuki dayanaklar çerçevesinde işlenmektedir:</p>
            <ul>
              <li><strong>Sözleşmenin ifası (KVKK m.5/2-c):</strong> Hizmetin sunulabilmesi için zorunlu veriler.</li>
              <li><strong>Meşru menfaat (KVKK m.5/2-f):</strong> Güvenlik logları, hizmet iyileştirme.</li>
              <li><strong>Açık rıza (KVKK m.5/1):</strong> Pazarlama iletişimi, isteğe bağlı analiz paylaşımı.</li>
              <li><strong>Hukuki yükümlülük (KVKK m.5/2-ç):</strong> Vergi ve muhasebe mevzuatı.</li>
            </ul>
          </Section>

          <Section title="5. Veri Aktarımı">
            <p>Kişisel verileriniz aşağıdaki taraflarla paylaşılabilir:</p>
            <ul>
              <li><strong>AWS (Amazon Web Services):</strong> Veri depolama — Frankfurt (eu-central-1) sunucuları.</li>
              <li><strong>Stripe:</strong> Ödeme altyapısı — yalnızca abonelik işlemleri için.</li>
              <li><strong>Sendgrid / SMTP sağlayıcısı:</strong> E-posta bildirimleri için.</li>
              <li><strong>Yasal merciler:</strong> Mahkeme kararı veya yasal zorunluluk halinde.</li>
            </ul>
            <p>Verileriniz, yukarıdakilerin dışında üçüncü taraflarla paylaşılmaz veya satılmaz.</p>
          </Section>

          <Section title="6. Saklama Süreleri">
            <ul>
              <li>Hesap verileri: Hesap silme talebinden itibaren 30 gün içinde silinir.</li>
              <li>Harcama / seyahat belgeleri: Yasal saklama yükümlülüğü olan belgeler için 10 yıl (TTK m.82).</li>
              <li>Log ve teknik veriler: 12 ay.</li>
              <li>OTP kayıtları: 5 dakika (TTL sonunda otomatik silinir).</li>
            </ul>
          </Section>

          <Section title="7. Haklarınız (KVKK m.11)">
            <p>İlgili kişi sıfatıyla aşağıdaki haklara sahipsiniz:</p>
            <ul>
              <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
              <li>İşlenmişse bilgi talep etme</li>
              <li>İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme</li>
              <li>Aktarıldığı üçüncü kişileri bilme</li>
              <li>Eksik veya yanlış verilerin düzeltilmesini isteme</li>
              <li>Verilerin silinmesini veya yok edilmesini isteme</li>
              <li>Otomatik sistemlerle analiz edilmesi sonucu aleyhinize doğan karara itiraz etme</li>
              <li>Zararın giderilmesini talep etme</li>
            </ul>
            <p>
              Haklarınızı kullanmak için:{' '}
              <a href="mailto:kvkk@flowtera.app">kvkk@flowtera.app</a> adresine
              kimliğinizi doğrulayan bilgilerle e-posta gönderebilirsiniz.
              Talepleriniz 30 gün içinde yanıtlanır.
            </p>
          </Section>

          <Section title="8. Güvenlik Önlemleri">
            <p>
              Verilerinizin güvenliği için teknik ve idari tedbirler alınmaktadır:
            </p>
            <ul>
              <li>TLS 1.3 şifreli iletişim</li>
              <li>AWS S3 sunucu taraflı şifreleme (SSE-S3)</li>
              <li>JWT tabanlı kimlik doğrulama</li>
              <li>Makbuz erişimi için süreli presigned URL (5 dakika TTL)</li>
              <li>Brute-force koruması (OTP max 5 deneme)</li>
              <li>Disposable e-posta engelleme</li>
            </ul>
          </Section>

          <Section title="9. Çerezler (Cookies)">
            <p>
              FlowTera, oturum yönetimi ve uygulama güvenliği amacıyla zorunlu oturum
              depolama alanı (sessionStorage / localStorage) kullanır. Pazarlama veya
              üçüncü taraf takip çerezleri kullanılmaz.
            </p>
          </Section>

          <Section title="10. İletişim ve Şikâyet">
            <p>
              Bu metin hakkında sorularınız veya Kişisel Verileri Koruma Kurumu'na
              (KVKK) başvurmadan önce bizimle iletişime geçmek için:
            </p>
            <p>
              E-posta: <a href="mailto:kvkk@flowtera.app">kvkk@flowtera.app</a><br />
              KVKK Kurumu: <a href="https://www.kvkk.gov.tr" target="_blank" rel="noreferrer">www.kvkk.gov.tr</a>
            </p>
          </Section>
        </div>

        {/* Footer */}
        <div className="legal-footer">
          <p>Bu metni okuyup anladıysanız kayıt sayfasına dönebilirsiniz.</p>
          <Link to="/signup" className="legal-cta-btn">← Kayıt Sayfasına Dön</Link>
        </div>
      </div>
    </div>
  );
};

export default KvkkPage;
