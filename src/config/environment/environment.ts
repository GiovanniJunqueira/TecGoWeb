export const environment = {
  THEME: (import.meta.env.VITE_THEME as "light" | "dark") || "light",
  DEALERSHIP: {
    NAME: import.meta.env.VITE_DEALERSHIP_NAME,
    LOGO: import.meta.env.VITE_DEALERSHIP_LOGO,
    EMAIL: import.meta.env.VITE_DEALERSHIP_EMAIL,
    PHONE: import.meta.env.VITE_DEALERSHIP_PHONE,
  },
};
