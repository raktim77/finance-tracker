import { motion, useAnimation } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { PendingSMSItem } from "./pendingDisplay";
import { markSwipeHintSeen } from "../../utils/appPreferences";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
type Props = {
    item: PendingSMSItem;
    children: React.ReactNode;
    onIgnore: (item: PendingSMSItem) => Promise<boolean>;
    showHint?: boolean;
};

export default function SwipeablePendingItem({
    item,
    children,
    onIgnore,
    showHint,
}: Props) {
    const controls = useAnimation();
    const hasShownHint = useRef(false);
    const [swiped, setSwiped] = useState(false);
    const hasTriggeredHaptic = useRef(false);

    useEffect(() => {
        if (!showHint || hasShownHint.current) return;
        hasShownHint.current = true;

        (async () => {
            await new Promise((r) => setTimeout(r, 600));
            await controls.start({ x: -48, transition: { duration: 0.3 } });
            await controls.start({ x: 0, transition: { duration: 0.3 } });
            markSwipeHintSeen();
        })();
    }, [controls, showHint]);


    return (
        <div className="relative overflow-hidden">
            {/* Ignore background revealed on swipe */}
            <div className="absolute inset-y-0 right-0 flex items-center justify-end px-5 bg-[var(--color-danger)]/10">
                <span className="text-[var(--color-danger)] font-black text-xs uppercase tracking-widest">
                    Ignore
                </span>
            </div>

            <motion.div
                drag={swiped ? false : "x"}
                dragConstraints={{ left: -120, right: 0 }}
                dragElastic={0.12}
                dragMomentum={false}
                animate={controls}
                onDrag={(_, info) => {
                    if (info.offset.x > 0) {
                        controls.set({ x: 0 });
                        return;
                    }
                    if (info.offset.x < -80 && !hasTriggeredHaptic.current) {
                        hasTriggeredHaptic.current = true;

                        Haptics.impact({ style: ImpactStyle.Medium }); // 👈 subtle tick
                    }

                    if (info.offset.x > -80) {
                        hasTriggeredHaptic.current = false; // reset if user drags back
                    }
                }}
                onDragEnd={async (_, info) => {
                    if (info.offset.x < -80) {
                        // Haptics.impact({ style: ImpactStyle.Medium });
                        // 1. Snap back to 0 first — UI is clean, no gesture state held
                        await controls.start({
                            x: 0,
                            transition: { type: "spring", stiffness: 300, damping: 25 },
                        });

                        // 2. Small delay so framer fully releases pointer capture
                        await new Promise((r) => setTimeout(r, 1));

                        // 3. Disable drag so swipe hint doesn't re-trigger
                        setSwiped(true);

                        // 4. Now open confirm modal — clean pointer state, first tap works
                        const confirmed = await onIgnore(item);

                        if (confirmed) {
                            // 5. Confirmed — animate out
                            await controls.start({
                                x: -500,
                                transition: { duration: 0.28, ease: "easeIn" },
                            });
                        } else {
                            // 6. Cancelled — re-enable drag
                            setSwiped(false);
                        }
                    } else {
                        // Haptics.impact({ style: ImpactStyle.Light }); 
                        controls.start({
                            x: 0,
                            transition: { type: "spring", stiffness: 300, damping: 25 },
                        });
                    }
                }}
                style={{ width: "100%", touchAction: "pan-y" }}
                className="relative bg-[var(--color-background)] md:bg-transparent"
            >
                {children}
            </motion.div>
        </div>
    );
}