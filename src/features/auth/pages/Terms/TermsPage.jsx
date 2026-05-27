import React from 'react';
import { Link } from 'react-router-dom';
import './TermsPage.css';

const LAST_UPDATED = '27 Mayıs 2026';
const COMPANY      = 'FlowTera Teknoloji A.Ş.';

const Section = ({ title, children }) => (
  <section className="legal-section">
    <h2 className="legal-section-title">{title}</h2>
    <div className="legal-section-body">{children}</div>
  </section>
);

const TermsPage = () => {
  React.useEffect(() => {
    document.title = 'Mesafeli Satış Sözleşmesi | FlowTera';
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
          <h1>Mesafeli Satış Sözleşmesi</h1>
          <p className="legal-meta">Son güncelleme: {LAST_UPDATED} · {COMPANY}</p>
        </div>

        {/* Content */}
        <div className="legal-content">
          <Section title="1. Taraflar">
            <p>
              Bu sözleşme, <strong>{COMPANY}</strong> (bundan böyle "Satıcı" olarak anılacaktır) ile
              FlowTera platformuna kayıt olan gerçek veya tüzel kişi (bundan böyle "Alıcı" olarak anılacaktır)
              arasında, Mesafeli Sözleşmeler Yönetmeliği kapsamında elektronik ortamda kurulmaktadır.
            </p>
          </Section>

          <Section title="2. Konu ve Kapsam">
            <p>
              Bu sözleşmenin konusu; Alıcı'nın, Satıcı'ya ait <strong>flowtera.app</strong> alan adlı
              web sitesi üzerinden satın aldığı hizmet aboneliğinin (Free, Premium, Enterprise)
              koşullarını düzenlemektir.
            </p>
            <p>
              FlowTera; takım bazlı harcama yönetimi, AI destekli fatura analizi, OCR makbuz tarama
              ve seyahat yönetimi hizmetlerini SaaS modeliyle sunan bir yazılım platformudur.
            </p>
          </Section>

          <Section title="3. Abonelik ve Ücretlendirme">
            <ul>
              <li><strong>Free Plan:</strong> Ücretsizdir. En fazla 1 takım, 5 üye. Sınırlı özellik.</li>
              <li><strong>Premium Plan:</strong> Aylık veya yıllık ücrete tabidir. Sınırsız üye ve gelişmiş özellikler.</li>
              <li><strong>Enterprise Plan:</strong> Kurumsal kullanım için özel fiyatlandırma. Satış ekibiyle iletişime geçiniz.</li>
            </ul>
            <p>
              Abonelik ücretleri, seçilen ödeme dönemine (aylık/yıllık) göre belirlenir ve dönem başında
              tahsil edilir. Fiyatlar KDV hariç listelenmiş olup ilgili vergi Alıcı'ya ayrıca yansıtılır.
            </p>
          </Section>

          <Section title="4. Cayma Hakkı">
            <p>
              Alıcı, abonelik başlangıcından itibaren <strong>14 gün</strong> içinde herhangi bir gerekçe
              göstermeksizin cayma hakkını kullanabilir. Cayma talebini, destek@flowtera.app adresine
              e-posta göndererek iletebilir.
            </p>
            <p>
              Dijital içerik veya hizmetin kullanımı başlatılmış ise cayma hakkı hukuken sona erer.
              Free plan aboneliği için cayma hakkı uygulanmaz.
            </p>
          </Section>

          <Section title="5. Hizmet Kullanımı ve Kısıtlamalar">
            <ul>
              <li>Platform yalnızca yasal ticari faaliyetler için kullanılabilir.</li>
              <li>Hesap başkasına devredilemez veya paylaşılamaz.</li>
              <li>Sisteme zarar verecek, güvenliğini tehdit edecek davranışlar yasaktır.</li>
              <li>Alıcı, yüklediği içeriklerden (makbuz, fatura vb.) hukuken sorumludur.</li>
            </ul>
          </Section>

          <Section title="6. Veri Güvenliği ve Gizlilik">
            <p>
              Alıcı'ya ait kişisel veriler, FlowTera Gizlilik Politikası ve KVKK Aydınlatma Metni
              çerçevesinde işlenir ve saklanır. Veriler üçüncü taraflarla Alıcı'nın rızası olmaksızın
              paylaşılmaz.
            </p>
            <p>
              Tüm veriler EU/TR veri merkezlerinde (AWS eu-central-1 bölgesi) şifreli olarak depolanır.
            </p>
          </Section>

          <Section title="7. Hizmet Kesintisi ve Sorumluluk Sınırı">
            <p>
              Satıcı, planlı bakım, teknik arıza veya mücbir sebep durumlarında hizmet kesintisi yaşanabileceğini
              önceden duyurmayı taahhüt eder. Satıcı'nın sorumluluğu, her halükarda son 3 aylık abonelik
              bedeliyle sınırlıdır.
            </p>
          </Section>

          <Section title="8. Sözleşmenin Feshi">
            <p>
              Alıcı, aboneliğini istediği zaman iptal edebilir. İptal, mevcut abonelik döneminin sonunda
              geçerli olur; kalan süre için ücret iadesi yapılmaz. Satıcı, kullanım şartlarının ihlali
              durumunda hesabı derhal askıya alma veya sonlandırma hakkını saklı tutar.
            </p>
          </Section>

          <Section title="9. Uygulanacak Hukuk ve Yetki">
            <p>
              Bu sözleşme Türkiye Cumhuriyeti kanunlarına tabidir. Anlaşmazlıklarda İstanbul
              Tüketici Mahkemeleri ve İstanbul Tüketici Hakem Heyeti yetkilidir.
            </p>
          </Section>

          <Section title="10. İletişim">
            <p>
              Sözleşmeye ilişkin sorularınız için:<br />
              E-posta: <a href="mailto:destek@flowtera.app">destek@flowtera.app</a><br />
              Adres: İstanbul, Türkiye
            </p>
          </Section>
        </div>

        {/* Footer */}
        <div className="legal-footer">
          <p>Bu belgeyi okuyup anladıysanız kayıt sayfasına dönebilirsiniz.</p>
          <Link to="/signup" className="legal-cta-btn">← Kayıt Sayfasına Dön</Link>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
