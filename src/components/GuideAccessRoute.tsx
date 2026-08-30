import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router";
import { guideService } from "../services/guideService";
import { freelanceGuideService } from "../services/freelanceGuideService";
import { useAuth } from "../context/AuthContext";
import { LoadingSpinner } from "./ui";

const approved = (value?: string | null) => value?.trim().toUpperCase() === "APPROVED";

export default function GuideAccessRoute() {
  const { userDTO } = useAuth();
  const [profileApproved, setProfileApproved] = useState<boolean | null>(null);

  const emailVerified = userDTO?.emailVerified === true;
  const accountActive = userDTO?.accountStatus?.trim().toUpperCase() === "ACTIVE";
  const userStatusActive = !userDTO?.userStatus || userDTO.userStatus.trim().toUpperCase() === "ACTIVE";
  const roleApproved = userDTO?.roleVerified === true || approved(userDTO?.verificationStatus) || approved(userDTO?.guideApprovalStatus) || approved(userDTO?.approvalStatus);

  useEffect(() => {
    if (!emailVerified || !accountActive || !userStatusActive || !roleApproved) {
      setProfileApproved(false);
      return;
    }
    let cancelled = false;
    Promise.allSettled([guideService.me(), freelanceGuideService.me()]).then(([modern, legacy]) => {
      if (cancelled) return;
      const modernProfile = modern.status === "fulfilled" ? modern.value.data.data : null;
      const legacyProfile = legacy.status === "fulfilled" ? legacy.value.data.data : null;
      const modernStatus = modernProfile?.guideApprovalStatus ?? modernProfile?.approvalStatus ?? modernProfile?.verificationStatus;
      setProfileApproved(approved(modernStatus) || approved(legacyProfile?.approvalStatus));
    });
    return () => { cancelled = true; };
  }, [accountActive, emailVerified, roleApproved, userStatusActive]);

  if (profileApproved === null) return <main className="grid min-h-[60vh] place-items-center"><LoadingSpinner label="Confirming guide approval" /></main>;
  if (!emailVerified || !accountActive || !userStatusActive || !roleApproved || !profileApproved) return <Navigate to="/guide/verification-status" replace />;
  return <Outlet />;
}
