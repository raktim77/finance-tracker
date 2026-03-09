import { Menu, Sun, Moon } from "lucide-react";
import { useContext } from "react";
import { ThemeContext } from "../../context/ThemeContext";
import ProfileMenu from "../ProfileMenu";
import LogoLight from "../../assets/images/only_logo.png";
import Logo from "../../assets/images/only_logo.png";
import { useNavigate } from "react-router-dom";

type Props = {
  toggleSidebar: () => void;
};

export default function Topbar({ toggleSidebar }: Props) {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();

  return (
    <header className="h-[var(--header-h)] flex items-center justify-between px-6 border-b border-black/10 bg-[var(--color-surface)] " >

      {/* Left */}
      <button
        onClick={toggleSidebar}
        className="p-2 rounded-lg hover:bg-black/5 transition lg:block hidden"
      >
        <Menu size={20} />
      </button>

      <div
        className="flex items-center cursor-pointer lg:hidden"
        onClick={() => navigate("/dashboard")}
      >
        <img
          src={theme === "light" ? LogoLight : Logo}
          alt="Xpensio Logo"
          className="w-10"
        />
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">

        <button
          onClick={toggleTheme}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-black/5"
        >
          {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        <ProfileMenu />

      </div>
    </header>
  );
}