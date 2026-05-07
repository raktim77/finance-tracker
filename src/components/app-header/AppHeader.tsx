import { Plus } from "lucide-react";
import { useHeaderContext } from "../../context/HeaderContext";
import LogoOnly from "../../assets/images/only_logo.png";
import Logo from "../../assets/images/logo.png";
import "./AppHeader.css";
import { isNativeCapacitorApp } from "../../lib/capacitor/platform";

export function AppHeader() {
  const { state } = useHeaderContext();
  const {
    isDashboard,
    backgroundColor,
    textColor,
    showShadow,
    titleVisible,
    actionVisible,
    actionLabel,
    onAction,
    logoVisible,
    title,
  } = state;
  const isApp = isNativeCapacitorApp()
  const heroMode = isDashboard && logoVisible && !titleVisible && !showShadow;
  return (
    <header
      className={`app-header ${heroMode ? "app-header--hero" : ""}`}
      style={{
        backgroundColor: heroMode ? "transparent" : backgroundColor,
        boxShadow: showShadow
          ? "0 1px 0 rgba(0,0,0,0.09)"
          : "0 0 0 rgba(0,0,0,0)",
        color: textColor,
      }}
    >
      {isApp ? (<div className="app-header__status-bar" />) : ""}

      {

        isDashboard ? (
          logoVisible ? (
             <nav className="app-header__nav-bar" aria-label="Mobile page header">
        <span
          className={`app-header__logo ${logoVisible ? "app-header__logo--visible" : ""
            }`}
          aria-hidden={!logoVisible}
        >
          <img src={LogoOnly} alt="Xpensio" className="app-header__logo-image" />
        </span>

        <span
          className={`app-header__title ${titleVisible ? "app-header__title--visible" : ""
            }`}
          aria-hidden={!titleVisible}
        >
          {title}
        </span>

        {actionLabel && (
          <button
            type="button"
            className={`app-header__action ${actionVisible ? "app-header__action--visible" : ""
              }`}
            style={{ color: textColor, borderColor: `${textColor}33` }}
            onClick={onAction ?? undefined}
            aria-label={actionLabel === "+" ? "Add transaction" : actionLabel}
            aria-hidden={!actionVisible}
            tabIndex={actionVisible ? 0 : -1}
          >
            {actionLabel === "+" ? <Plus size={20} strokeWidth={3} /> : actionLabel}
          </button>
        )}
      </nav>
          ) : (
            // Dashboard after scrolled
            <nav className="app-header__nav-bar flex items-center justify-center" aria-label="Mobile page header">
        <span
          className={`app-header__logo_scrolled`}
        >
          <img src={Logo} alt="Xpensio" className="app-header__logo-image_scrolled" />
        </span>


      </nav>
          )
        ) : (
          <nav className="app-header__nav-bar" aria-label="Mobile page header">
        <span
          className={`app-header__logo ${logoVisible ? "app-header__logo--visible" : ""
            }`}
          aria-hidden={!logoVisible}
        >
          <img src={LogoOnly} alt="Xpensio" className="app-header__logo-image" />
        </span>

        <span
          className={`app-header__title ${titleVisible ? "app-header__title--visible" : ""
            }`}
          aria-hidden={!titleVisible}
        >
          {title}
        </span>

        {actionLabel && (
          <button
            type="button"
            className={`app-header__action ${actionVisible ? "app-header__action--visible" : ""
              }`}
            style={{ color: textColor, borderColor: `${textColor}33` }}
            onClick={onAction ?? undefined}
            aria-label={actionLabel === "+" ? "Add transaction" : actionLabel}
            aria-hidden={!actionVisible}
            tabIndex={actionVisible ? 0 : -1}
          >
            {actionLabel === "+" ? <Plus size={20} strokeWidth={3} /> : actionLabel}
          </button>
        )}
      </nav>
        )

      }

{/* 
      {(isDashboard && logoVisible) ? (
        <nav className="app-header__nav-bar" aria-label="Mobile page header">
        <span
          className={`app-header__logo_scrolled`}
        >
          <img src={Logo} alt="Xpensio" className="app-header__logo-image_scrolled" />
        </span>


      </nav>

      ) : (
      <nav className="app-header__nav-bar" aria-label="Mobile page header">
        <span
          className={`app-header__logo ${logoVisible ? "app-header__logo--visible" : ""
            }`}
          aria-hidden={!logoVisible}
        >
          <img src={LogoOnly} alt="Xpensio" className="app-header__logo-image" />
        </span>

        <span
          className={`app-header__title ${titleVisible ? "app-header__title--visible" : ""
            }`}
          aria-hidden={!titleVisible}
        >
          {title}
        </span>

        {actionLabel && (
          <button
            type="button"
            className={`app-header__action ${actionVisible ? "app-header__action--visible" : ""
              }`}
            style={{ color: textColor, borderColor: `${textColor}33` }}
            onClick={onAction ?? undefined}
            aria-label={actionLabel === "+" ? "Add transaction" : actionLabel}
            aria-hidden={!actionVisible}
            tabIndex={actionVisible ? 0 : -1}
          >
            {actionLabel === "+" ? <Plus size={20} strokeWidth={3} /> : actionLabel}
          </button>
        )}
      </nav>
      )} */}

    </header>
  );
}
