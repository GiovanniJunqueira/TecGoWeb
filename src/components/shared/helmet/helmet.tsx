import { useLocation } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Formatter } from "@/lib/formatter";
import { useAuth } from "@/contexts/auth/auth.context";

export const HelmetDemo = () => {
  const { pathname } = useLocation();
  const { school } = useAuth();
  const pageTitle = Formatter.formatPathname(pathname);

  return (
    <Helmet>
      {school?.logoUrl && (
        <link rel="icon" href={school.logoUrl} type="image/svg+xml" />
      )}
      <title>
        {pageTitle} | {school?.name || "Tech Go"}
      </title>
    </Helmet>
  );
};
