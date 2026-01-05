import React from 'react';

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary'; // Define si quieres diferentes estilos para el botón
}

const GlassButton: React.FC<GlassButtonProps> = ({
  children,
  variant = 'primary',
  className,
  ...props
}) => {
  const baseClasses = "w-full p-4 rounded-xl font-extrabold uppercase shadow-xl transition-all duration-400 ease-in-out z-10";
  const primaryClasses = "bg-gradient-to-br from-[var(--primary-color)] to-[var(--secondary-color)] text-black shadow-[0_5px_20px_var(--glow-color)] hover:translate-y-[-2px] hover:brightness-125 hover:shadow-[0_8px_25px_var(--glow-color)]";
  // Puedes añadir un estilo secundario si lo necesitas
  const secondaryClasses = ""; // Por ahora, lo dejamos vacío o podemos definir un estilo diferente

  return (
    <button
      className={`${baseClasses} ${variant === 'primary' ? primaryClasses : secondaryClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default GlassButton;
