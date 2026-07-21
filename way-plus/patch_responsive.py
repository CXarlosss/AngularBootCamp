import os

def patch_file(filepath, replace_rules):
    if not os.path.exists(filepath):
        print(f"Not found: {filepath}")
        return
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    for old, new in replace_rules:
        if old in content:
            content = content.replace(old, new)
        else:
            print(f"Warning: Could not find target in {filepath}:\n{old}")
            
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Patched: {filepath}")

# 1. TherapistDashboard
patch_file(
    "src/features/therapist/pages/TherapistDashboard.tsx",
    [
        (
            "import { cn } from '@/shared/lib/utils';",
            "import { cn } from '@/shared/lib/utils';\nimport { RESPONSIVE, rw } from '@/shared/lib/wayResponsive';"
        ),
        (
            '<table className="w-full text-left border-collapse">',
            '<table className={rw("tableMinWidth", "w-full text-left border-collapse")}>'
        ),
        (
            '<td className="px-6 py-4 whitespace-nowrap align-middle">',
            '<td className={rw("tableCell", "whitespace-nowrap align-middle")}>'
        )
    ]
)

# 2. RewardsShopPage
patch_file(
    "src/features/rewards/pages/RewardsShopPage.tsx",
    [
        (
            "import { cn } from '@/shared/lib/utils';",
            "import { cn } from '@/shared/lib/utils';\nimport { RESPONSIVE } from '@/shared/lib/wayResponsive';"
        ),
        (
            '<div className="grid grid-cols-2 gap-3">',
            '<div className={RESPONSIVE.gridShop}>'
        )
    ]
)

# 3. MissionBoard
patch_file(
    "src/features/rewards/components/MissionBoard.tsx",
    [
        (
            "import './MissionBoard.css';",
            "import './MissionBoard.css';\nimport { RESPONSIVE } from '@/shared/lib/wayResponsive';"
        ),
        (
            '<div className="mission-list">',
            '<div className={`mission-list ${RESPONSIVE.gridAlbum}`}>'
        )
    ]
)

# 4. FamilyDashboardPage
patch_file(
    "src/components/family/FamilyDashboardPage.tsx",
    [
        (
            "import { usePushNotifications } from '@/features/notifications/hooks/usePushNotifications';",
            "import { usePushNotifications } from '@/features/notifications/hooks/usePushNotifications';\nimport { rw } from '@/shared/lib/wayResponsive';"
        ),
        (
            'className="text-7xl mb-4 drop-shadow-md relative z-10"',
            'className={rw("avatarHero", "mb-4 drop-shadow-md relative z-10")}'
        )
    ]
)

# 5. StepDetailsPage
patch_file(
    "src/features/player/pages/StepDetailsPage.tsx",
    [
        (
            "import type { Step } from '@/core/engine/types';",
            "import type { Step } from '@/core/engine/types';\nimport { rw } from '@/shared/lib/wayResponsive';"
        ),
        (
            '<div className="fixed bottom-0 left-0 right-0 bg-[#764ba2]/80 backdrop-blur-2xl border-t border-white/20 p-6 pb-10 z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.2)]">',
            '<div className={rw("safeBottom", "fixed bottom-0 left-0 right-0 bg-[#764ba2]/80 backdrop-blur-2xl border-t border-white/20 p-6 pb-10 z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.2]")}>'
        )
    ]
)

# 6. WayPlayerPage
patch_file(
    "src/features/content/pages/WayPlayerPage.tsx",
    [
        (
            "import { Button } from '@/shared/components/Button';",
            "import { Button } from '@/shared/components/Button';\nimport { rw } from '@/shared/lib/wayResponsive';"
        ),
        (
            '<header className="sticky top-0 z-50 bg-white border-b border-slate-200 px-4 py-2">',
            '<header className={rw("headerCompact", "sticky top-0 z-50 bg-white border-b border-slate-200 px-4")}>'
        )
    ]
)

# 7. DailyChest
patch_file(
    "src/features/rewards/components/DailyChest.tsx",
    [
        (
            "import type { DailyReward } from '../utils/dailyChestUtils';",
            "import type { DailyReward } from '../utils/dailyChestUtils';\nimport { rw } from '@/shared/lib/wayResponsive';"
        ),
        (
            "  'relative w-full max-w-sm mx-auto rounded-3xl p-8 text-center overflow-hidden cursor-pointer select-none forced-colors:border-2 forced-colors:border-[#1E1B4B]';",
            "  rw('modalWidth', 'relative mx-auto rounded-3xl p-8 text-center overflow-hidden cursor-pointer select-none forced-colors:border-2 forced-colors:border-[#1E1B4B]');"
        ),
        (
            "  'w-full max-w-sm bg-white/95 backdrop-blur-xl rounded-[2.5rem] p-8 text-center shadow-2xl border-4 border-white/80 relative overflow-hidden forced-colors:bg-white forced-colors:border-4 forced-colors:border-[#1E1B4B]';",
            "  rw('modalWidth', 'bg-white/95 backdrop-blur-xl rounded-[2.5rem] p-8 text-center shadow-2xl border-4 border-white/80 relative overflow-hidden forced-colors:bg-white forced-colors:border-4 forced-colors:border-[#1E1B4B]');"
        )
    ]
)

# 8. ZenModePage
patch_file(
    "src/features/annexes/pages/ZenModePage.tsx",
    [
        (
            "import { ArrowLeft, Wind, Droplets, TreePine, Waves } from 'lucide-react';",
            "import { ArrowLeft, Wind, Droplets, TreePine, Waves } from 'lucide-react';\nimport { RESPONSIVE } from '@/shared/lib/wayResponsive';"
        ),
        (
            "        <div style={{ \n          display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', \n          gap: 16, width: '100%', maxWidth: 320 \n        }}>",
            "        <div className={RESPONSIVE.gridZen}>"
        )
    ]
)

