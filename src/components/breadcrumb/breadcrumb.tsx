import React from "react";
import { useLocation, Link } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Formatter } from "@/lib/formatter";

export function BreadCrumb() {
  const location = useLocation();

  const pathSegments = location.pathname
    .split("/")
    .filter((segment) => segment);

  const lastSegment = pathSegments[pathSegments.length - 1];

  const fullPaths = pathSegments.map((_, index) => {
    const path = "/" + pathSegments.slice(0, index + 1).join("/");
    return {
      path,
      label: Formatter.formatPathname(path),
    };
  });

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {fullPaths.length > 0 ? (
          <>
            {fullPaths.slice(0, -1).map((segment, index) => (
              <React.Fragment key={index}>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to={segment.path}>{segment.label}</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </React.Fragment>
            ))}

            <BreadcrumbItem>
              <BreadcrumbPage>
                {Formatter.formatPathname("/" + lastSegment)}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </>
        ) : (
          <BreadcrumbItem>
            <BreadcrumbPage>Página Inicial</BreadcrumbPage>
          </BreadcrumbItem>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
