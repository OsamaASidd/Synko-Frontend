import { GlobalContext } from "@/context";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import Swal from "sweetalert2";
import FullPageLoader from "./ui/full-page-loader";

const ProtectedRoute = ({ children, pageName }) => {
  const router = useRouter();
  const { userRole } = useContext(GlobalContext);
  const [isPageLoading, setIsPageLoading] = useState(true);

  useEffect(() => {
    if (userRole?.role) {
      if (
        (userRole?.role?.role !== "owner" &&
          !userRole?.role?.role_permissions.some(
            (val) => val?.default_permission?.permission == pageName
          )) ||
        (userRole?.role?.role !== "owner" &&
          ["manager", "merchants", "settings"].includes(pageName))
      ) {
        Swal.fire({
          icon: "warning",
          text: "You don't have access to this page!",
        });
        router.push("/dashboard");
      } else {
        setIsPageLoading(false);
      }
    }
  }, [userRole, router]);

  if (isPageLoading == true || isPageLoading === "undefined") {
    return <FullPageLoader />;
  }

  return children;
};

export default ProtectedRoute;
