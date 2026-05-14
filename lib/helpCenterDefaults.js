/** Home “Discover how we can help” — used when CMS has no row yet. Always four cards (no tabs). */
export const HELP_CENTER_CARD_COUNT = 4;

export const DEFAULT_HELP_CENTER_CONTENT = {
  heading: "Discover how we can help",
  subheading:
    "Whether you are buying, renting, or selling, Global Realty offers verified listings, clear paperwork, and local market guidance at every step.",
  cards: [
    {
      title: "Browse homes\nfor sale",
      description:
        "Shortlist verified resale and new-build options by location, budget, and property type—with clear pricing and paperwork support from day one.",
      buttonLabel: "Browse sale listings",
      buttonHref: "/properties?listingType=sale",
      icon: "house",
    },
    {
      title: "Find long-term\nrentals",
      description:
        "Explore vetted rental homes with accurate photos, society and deposit terms explained, and a team that coordinates viewings through move-in.",
      buttonLabel: "View rental homes",
      buttonHref: "/properties?listingType=rent",
      icon: "key",
    },
    {
      title: "Plan your budget\nand EMI",
      description:
        "Estimate monthly outgoings before you shortlist: adjust loan amount, tenure, and rate to compare scenarios side by side on the home page.",
      buttonLabel: "Open loan calculator",
      buttonHref: "/#loan-calculator",
      icon: "wallet",
    },
    {
      title: "List or sell\nwith confidence",
      description:
        "From fair market benchmarking and listing copy to inquiry screening and visits—we market your property to serious buyers and keep you informed.",
      buttonLabel: "Talk to our team",
      buttonHref: "/contact",
      icon: "agent",
    },
  ],
  footerLine: "Looking to spotlight a unique property with expert marketing?",
  footerCtaLabel: "Let's chat",
  footerCtaHref: "/contact",
};
