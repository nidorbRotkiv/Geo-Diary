"use client";

import { useState } from "react";
import DrawerMenu from "@/app/components/global/DrawerMenu";
import PageHolder from "@/app/components/global/PageHolder";
import Follow from "@/app/components/Account/Follow/Follow";
import DangerZone from "@/app/components/Account/DangerZone";
import { Badge } from "@/app/components/global/Badge";

export default function Account() {
  const followBadgeText = "follow";
  const dangerZoneBadgeText = "dangerZone";

  const [selectedBadge, setSelectedBadge] = useState(followBadgeText);

  return (
    <PageHolder>
      <DrawerMenu />
      <main className="py-5 px-5 w-full">
        <div className="flex justify-center space-x-5">
          <Badge
            label="Follow"
            isSelected={selectedBadge === followBadgeText}
            onClick={() => setSelectedBadge(followBadgeText)}
          />
          <Badge
            label="Danger Zone"
            isSelected={selectedBadge === dangerZoneBadgeText}
            onClick={() => setSelectedBadge(dangerZoneBadgeText)}
          />
        </div>
        {selectedBadge === followBadgeText && <Follow />}
        {selectedBadge === dangerZoneBadgeText && <DangerZone />}
      </main>
    </PageHolder>
  );
}
