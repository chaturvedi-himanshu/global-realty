/** Maps CMS icon key to theme icomoon class inside `.tf-icon`. */
export function helpCenterIconClass(icon) {
  switch (icon) {
    case "wallet":
      return "icon-money";
    case "key":
      return "icon-sale";
    case "agent":
      return "icon-agent";
    case "house":
    default:
      return "icon-house";
  }
}
