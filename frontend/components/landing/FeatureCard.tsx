interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  highlighted?: boolean;
}

export function FeatureCard({
  icon,
  title,
  description,
  highlighted = false,
}: FeatureCardProps) {
  if (highlighted) {
    return (
      <div
        style={{
          position: "relative",
          background: "#CC1F1F",
          border: "1px solid #CC1F1F",
          borderRadius: 16,
          padding: 24,
          boxShadow: "0 22px 48px rgba(204,31,31,0.28)",
          overflow: "hidden",
          height: "100%",
        }}
      >
        {/* Radial glow */}
        <div
          style={{
            position: "absolute",
            top: -40,
            right: -40,
            width: 160,
            height: 160,
            background:
              "radial-gradient(circle, rgba(255,255,255,0.14), transparent 70%)",
            borderRadius: "50%",
          }}
        />

        {/* Badge */}
        <div
          style={{
            position: "absolute",
            top: 22,
            right: 22,
            background: "rgba(255,255,255,0.18)",
            border: "1px solid rgba(255,255,255,0.28)",
            padding: "5px 11px",
            borderRadius: 100,
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: "0.04em",
            textTransform: "uppercase" as const,
            color: "#fff",
          }}
        >
          White-label
        </div>

        {/* Icon */}
        <div
          style={{
            position: "relative",
            width: 46,
            height: 46,
            borderRadius: 12,
            background: "rgba(255,255,255,0.16)",
            border: "1px solid rgba(255,255,255,0.24)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 16,
          }}
        >
          {icon}
        </div>

        <h3
          style={{
            position: "relative",
            fontSize: 17,
            fontWeight: 800,
            letterSpacing: "-0.01em",
            color: "#fff",
            marginBottom: 7,
          }}
        >
          {title}
        </h3>
        <p
          style={{
            position: "relative",
            fontSize: 14,
            lineHeight: 1.55,
            fontWeight: 500,
            color: "rgba(255,255,255,0.86)",
          }}
        >
          {description}
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #ece4e4",
        borderRadius: 16,
        padding: 24,
        height: "100%",
      }}
      className="hover:shadow-md transition-shadow duration-200"
    >
      <div
        style={{
          width: 46,
          height: 46,
          borderRadius: 12,
          background: "#fcf5f5",
          border: "1px solid #f4e9e9",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 16,
        }}
      >
        {icon}
      </div>
      <h3
        style={{
          fontSize: 17,
          fontWeight: 800,
          letterSpacing: "-0.01em",
          color: "#16100f",
          marginBottom: 7,
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontSize: 14,
          lineHeight: 1.55,
          fontWeight: 500,
          color: "#6a605e",
        }}
      >
        {description}
      </p>
    </div>
  );
}
