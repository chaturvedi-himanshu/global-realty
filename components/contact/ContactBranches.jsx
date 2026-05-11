import { FaMapMarkerAlt } from "react-icons/fa";

export default function ContactBranches({ offices = [] }) {
  const validOffices = offices.filter((office) => {
    const city = String(office?.city || "").trim();
    const rera = String(office?.reraNumber || "").trim();
    const address = String(office?.address || "").trim();
    return Boolean(city || rera || address);
  });

  if (!validOffices.length) return null;

  return (
    <section className="ci-branches-section" aria-label="Other offices">
      <div className="tf-container">
        <div className="ci-branches-header">
          <span className="ci-branches-header__eyebrow">Our Presence</span>
          <h2 className="ci-branches-header__title">Other Office Addresses</h2>
          <p className="ci-branches-header__sub">
            We have offices across major cities to serve you better.
          </p>
        </div>
        <div className="ci-branches-grid">
          {validOffices.map((office, i) => (
            <div key={i} className="ci-branch-card">
              <div className="ci-branch-card__icon">
                <FaMapMarkerAlt />
              </div>
              <div className="ci-branch-card__body">
                <h3 className="ci-branch-card__city">{office.city}</h3>
                {office.reraNumber && (
                  <p className="ci-branch-card__rera">RERA: {office.reraNumber}</p>
                )}
                {office.address && (
                  <p className="ci-branch-card__addr" style={{ whiteSpace: "pre-line" }}>
                    {office.address}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
