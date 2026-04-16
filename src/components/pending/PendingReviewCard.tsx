import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPendingSMS } from "../../lib/localDb";
import { isNativeAndroidApp } from "../../lib/capacitor/platform";

export default function PendingReviewCard() {

    const [count, setCount] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        const load = async () => {
            if (!isNativeAndroidApp()) return;

            const data = await getPendingSMS();
            setCount(data.length);
        };

        load();
    }, []);

    if (count === 0) return null;
    if (!isNativeAndroidApp()) return null;
    return (
        <div
            onClick={() => navigate("/pending-review")}
            className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white p-4 rounded-2xl cursor-pointer shadow-lg hover:scale-[1.02] transition"
        >
            <div className="text-sm opacity-90">Pending Review</div>
            <div className="text-2xl font-bold">{count} transactions</div>
            <div className="text-xs opacity-80 mt-1">
                Tap to review and save them
            </div>
        </div>
    );
}