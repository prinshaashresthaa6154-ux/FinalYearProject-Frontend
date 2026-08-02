import { useState } from "react";

type SettingKey =
  | "maintenanceMode"
  | "newRegistrations"
  | "guideVerification"
  | "paymentGateway"
  | "emailNotifications"
  | "twoFactorAuth";

interface PlatformSetting {
  key: SettingKey;
  title: string;
  description: string;
}

const SETTINGS: PlatformSetting[] = [
  {
    key: "maintenanceMode",
    title: "Maintenance Mode",
    description: "Take the platform offline for maintenance",
  },
  {
    key: "newRegistrations",
    title: "New Registrations",
    description: "Allow new user sign-ups",
  },
  {
    key: "guideVerification",
    title: "Guide Verification",
    description: "Require document verification for guides",
  },
  {
    key: "paymentGateway",
    title: "Payment Gateway",
    description: "Enable online payment processing",
  },
  {
    key: "emailNotifications",
    title: "Email Notifications",
    description: "Send email notifications to users",
  },
  {
    key: "twoFactorAuth",
    title: "Two-Factor Auth",
    description: "Require 2FA for admin accounts",
  },
];

export default function PlatformSettings() {
  const [settings, setSettings] = useState<Record<SettingKey, boolean>>({
    maintenanceMode: false,
    newRegistrations: true,
    guideVerification: true,
    paymentGateway: true,
    emailNotifications: true,
    twoFactorAuth: true,
  });

  const toggleSetting = (key: SettingKey) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="bg-white border border-[#eae3dc] rounded-2xl shadow-sm overflow-hidden">
      <div className="p-6 pb-5">
        <h2 className="text-xl font-bold text-[#1a130e] tracking-tight font-serif">
          Platform Configuration
        </h2>
      </div>

      <div className="px-6 pb-6 space-y-3">
        {SETTINGS.map((setting) => {
          const enabled = settings[setting.key];

          return (
            <div
              key={setting.key}
              className="flex items-center justify-between gap-4 rounded-xl border border-[#eae3dc] bg-white px-5 py-4"
            >
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-[#1a130e]">
                  {setting.title}
                </h3>
                <p className="mt-0.5 text-sm text-gray-400 font-medium">
                  {setting.description}
                </p>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={enabled}
                aria-label={setting.title}
                onClick={() => toggleSetting(setting.key)}
                className={`relative shrink-0 h-7 w-12 rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#b31919]/40 ${
                  enabled ? "bg-[#b31919]" : "bg-[#d4ccc4]"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                    enabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
