import React from "react";

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  className?: string;
}

/**
 * COLIBRÍ - Mensajero del viento, vida y movimiento.
 * Diseño geométrico premium y estilizado en pleno vuelo.
 */
export const ColibriIcon = ({ size = 64, className = "text-flamenco", ...props }: IconProps) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Cuerpo y cola */}
      <path
        d="M50 45 C50 45 42 62 25 65 C32 58 45 52 48 48 C49 46 51 40 50 35 C49 28 54 22 62 25 C66 26.5 68 32 64 36 C60 40 50 45 50 45 Z"
        fill="currentColor"
        opacity="0.9"
      />
      {/* Pico largo */}
      <path
        d="M62 25 L88 18 L64 28 Z"
        fill="currentColor"
      />
      {/* Ala superior (movimiento) */}
      <path
        d="M52 35 C58 20 72 8 82 12 C78 22 68 32 50 38"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Ala inferior */}
      <path
        d="M48 40 C42 48 30 55 22 50 C28 44 40 40 48 39"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.8"
      />
      {/* Ojo del colibrí */}
      <circle cx="58" cy="27" r="1.5" fill="#F3E9D7" />
      {/* Destellos de movimiento ancestral */}
      <line x1="22" y1="68" x2="16" y2="72" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="20" y1="62" x2="12" y2="64" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
};

/**
 * FLAMENCO ROSADO - Elegancia y distinción.
 * Diseño minimalista con finas líneas y el tono flamenco insignia.
 */
export const FlamencoIcon = ({ size = 64, className = "text-flamenco", ...props }: IconProps) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Cuerpo principal */}
      <path
        d="M52 42 C64 42 75 48 72 60 C68 70 52 72 45 62 C38 52 40 42 52 42 Z"
        fill="currentColor"
        opacity="0.85"
      />
      {/* Cuello elegante */}
      <path
        d="M45 55 C42 38 48 20 38 18 C30 16 28 28 35 32 C38 34 40 38 41 42"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Pico característico */}
      <path
        d="M32 20 C32 20 25 21 24 24 C23 27 26 28 28 28 C30 28 33 24 33 24"
        fill="currentColor"
      />
      <path
        d="M24 24 L21 27 L25 28 Z"
        fill="#2B2420" /* Punta negra del pico */
      />
      {/* Patas largas */}
      <line x1="50" y1="68" x2="50" y2="92" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path
        d="M50 72 L42 80 L50 82"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Plumas decorativas */}
      <path d="M56 48 C62 48 66 52 64 56" stroke="#F7C5D2" strokeWidth="2" strokeLinecap="round" />
      <path d="M52 54 C58 54 62 58 60 62" stroke="#F7C5D2" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
};

/**
 * CARDENAL GUAJIRO - Raíz profunda y acento vibrante.
 * Diseño geométrico nítido del cardenal de copete rojo intenso.
 */
export const CardenalIcon = ({ size = 64, className = "text-cardenal", ...props }: IconProps) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Copete insignia y cabeza */}
      <path
        d="M32 18 C38 22 45 15 50 8 C48 18 56 22 58 26 C60 30 58 36 52 38 C44 40 38 34 38 28 C38 24 32 20 32 18 Z"
        fill="currentColor"
      />
      {/* Cuerpo y alas */}
      <path
        d="M52 38 C68 40 78 50 75 65 C72 75 58 82 45 80 C32 78 30 65 38 52 C42 46 48 40 52 38 Z"
        fill="currentColor"
        opacity="0.9"
      />
      {/* Antifaz negro característico */}
      <path
        d="M52 26 C53 28 55 30 58 28 C60 27 58 25 56 24 C54 23 52 24 52 26 Z"
        fill="#2B2420"
      />
      {/* Pico cónico fuerte */}
      <path
        d="M58 27 L70 30 L59 34 Z"
        fill="#E2CFA8"
      />
      {/* Ala acentuada */}
      <path
        d="M48 48 C56 50 68 56 64 68 C61 74 52 75 48 70"
        stroke="#2B2420"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Cola del ave */}
      <path
        d="M38 74 L18 90 L26 78 Z"
        fill="currentColor"
      />
    </svg>
  );
};

/**
 * CACTUS / CARDÓN - Resiliencia del desierto guajiro (Iguaraya).
 * Líneas limpias que muestran su estructura simétrica y espinas elegantes.
 */
export const CactusIcon = ({ size = 64, className = "text-cardon", ...props }: IconProps) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Tallo central */}
      <rect x="44" y="15" width="12" height="70" rx="6" fill="currentColor" />
      {/* Brazo izquierdo */}
      <path
        d="M44 55 H28 C22 55 22 45 22 40 V28 C22 24 28 24 28 28 V40 C28 44 38 44 44 44"
        fill="currentColor"
      />
      {/* Brazo derecho */}
      <path
        d="M56 62 H72 C78 62 78 52 78 48 V34 C78 30 84 30 84 34 V48 C84 52 74 52 56 52"
        fill="currentColor"
      />
      {/* Flor del cactus (Iguaraya) en la punta */}
      <circle cx="50" cy="12" r="3.5" fill="#C1272D" />
      <circle cx="25" cy="24" r="2.5" fill="#C1272D" opacity="0.8" />
      <circle cx="81" cy="30" r="2.5" fill="#C1272D" opacity="0.8" />
      
      {/* Textura de líneas del cardón */}
      <line x1="50" y1="20" x2="50" y2="80" stroke="#F3E9D7" strokeWidth="1.5" strokeDasharray="3 3" />
      
      {/* Espinas minimalistas */}
      <line x1="44" y1="30" x2="38" y2="28" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="56" y1="35" x2="62" y2="33" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="44" y1="50" x2="38" y2="52" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="56" y1="65" x2="62" y2="67" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      
      {/* Suelo del desierto */}
      <path d="M15 85 C35 83 65 87 85 85" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M25 90 C45 89 55 91 75 90" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
};

/**
 * LIRIO GUAJIRO - Delicadeza y ornamentación floral.
 * Geometría orgánica y elegante de pétalos abiertos.
 */
export const LirioIcon = ({ size = 64, className = "text-caribe", ...props }: IconProps) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Tallo */}
      <path d="M50 50 C50 65 52 82 45 92" stroke="#6E8156" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      
      {/* Pétalos traseros */}
      <path d="M35 45 C20 30 18 18 35 25 C42 28 46 38 50 50 C46 38 42 28 35 45 Z" fill="currentColor" opacity="0.6" />
      <path d="M65 45 C80 30 82 18 65 25 C58 28 54 38 50 50 C54 38 58 28 65 45 Z" fill="currentColor" opacity="0.6" />
      
      {/* Pétalo central principal */}
      <path d="M50 15 C42 30 42 45 50 55 C58 45 58 30 50 15 Z" fill="currentColor" />
      
      {/* Pétalos laterales frontales */}
      <path d="M50 50 C40 38 25 38 28 48 C30 58 44 55 50 50 Z" fill="currentColor" opacity="0.9" />
      <path d="M50 50 C60 38 75 38 72 48 C70 58 56 55 50 50 Z" fill="currentColor" opacity="0.9" />
      
      {/* Pistilos dorados */}
      <path d="M50 40 Q45 28 38 25" stroke="#E2CFA8" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M50 40 Q50 24 50 20" stroke="#E2CFA8" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M50 40 Q55 28 62 25" stroke="#E2CFA8" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <circle cx="38" cy="25" r="1.5" fill="#E2CFA8" />
      <circle cx="50" cy="20" r="1.5" fill="#E2CFA8" />
      <circle cx="62" cy="25" r="1.5" fill="#E2CFA8" />
    </svg>
  );
};

/**
 * PEONÍA - Calidez y abundancia.
 * Diseño radial con capas concéntricas de pétalos finos.
 */
export const PeoniaIcon = ({ size = 64, className = "text-flamenco", ...props }: IconProps) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Pétalos exteriores grandes */}
      <circle cx="50" cy="50" r="38" stroke="currentColor" strokeWidth="1.5" strokeDasharray="6 3" opacity="0.3" />
      
      <path d="M50 12 C35 12 30 30 50 35 C70 30 65 12 50 12 Z" fill="currentColor" opacity="0.3" />
      <path d="M50 88 C35 88 30 70 50 65 C70 70 65 88 50 88 Z" fill="currentColor" opacity="0.3" />
      <path d="M12 50 C12 35 30 30 35 50 C30 70 12 65 12 50 Z" fill="currentColor" opacity="0.3" />
      <path d="M88 50 C88 35 70 30 65 50 C70 70 88 65 88 50 Z" fill="currentColor" opacity="0.3" />
      
      {/* Capa intermedia de pétalos */}
      <path d="M50 22 C40 22 36 38 50 42 C64 38 60 22 50 22 Z" fill="currentColor" opacity="0.6" />
      <path d="M50 78 C40 78 36 62 50 58 C64 62 60 78 50 78 Z" fill="currentColor" opacity="0.6" />
      <path d="M22 50 C22 40 38 36 42 50 C38 64 22 60 22 50 Z" fill="currentColor" opacity="0.6" />
      <path d="M78 50 C78 40 62 36 58 50 C62 64 78 60 78 50 Z" fill="currentColor" opacity="0.6" />
      
      {/* Pétalos del núcleo central */}
      <path d="M50 32 C45 32 42 42 50 45 C58 42 55 32 50 32 Z" fill="currentColor" />
      <path d="M50 68 C45 68 42 58 50 55 C58 58 55 68 50 68 Z" fill="currentColor" />
      <path d="M32 50 C32 45 42 42 45 50 C42 58 32 55 32 50 Z" fill="currentColor" />
      <path d="M68 50 C68 45 58 42 55 50 C58 58 68 55 68 50 Z" fill="currentColor" />
      
      {/* Botón central radiante */}
      <circle cx="50" cy="50" r="6" fill="#E2CFA8" />
      <circle cx="50" cy="50" r="3" fill="#C1272D" />
    </svg>
  );
};

/**
 * DELFÍN - El mar Caribe guajiro y la frescura de sus olas.
 * Salto arqueado dinámico y líneas fluidas que evocan agua.
 */
export const DelfinIcon = ({ size = 64, className = "text-caribe", ...props }: IconProps) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Olas del mar en la base */}
      <path
        d="M15 75 C30 68 40 82 55 75 C70 68 80 82 95 75 L95 85 L15 85 Z"
        fill="currentColor"
        opacity="0.25"
      />
      <path
        d="M5 80 C20 75 30 85 45 80 C60 75 70 85 85 80 C92 78 95 82 98 82"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      
      {/* Cuerpo del delfín arqueado */}
      <path
        d="M20 62 C32 42 52 28 78 35 C64 35 52 42 42 52 C35 58 30 65 20 62 Z"
        fill="currentColor"
      />
      {/* Aleta dorsal */}
      <path
        d="M48 38 C54 28 62 25 58 36 C55 42 50 44 48 38 Z"
        fill="currentColor"
      />
      {/* Cabeza y hocico */}
      <path
        d="M78 35 C83 36 88 40 86 43 C84 46 80 44 76 43 C72 42 70 41 78 35 Z"
        fill="currentColor"
      />
      {/* Aleta pectoral */}
      <path
        d="M42 52 C38 58 34 60 36 55 C38 52 40 50 42 52 Z"
        fill="currentColor"
        opacity="0.8"
      />
      {/* Cola saltando */}
      <path
        d="M22 62 L10 68 L15 58 C18 56 20 60 22 62 Z"
        fill="currentColor"
      />
      {/* Ojo del delfín */}
      <circle cx="78" cy="39" r="1" fill="#F3E9D7" />
    </svg>
  );
};

/**
 * KANA CORTE GEOMÉTRICO (Borde Separador)
 * Un ribete decorativo que divide secciones usando la riqueza del diseño Wayuu.
 */
export const WayuuDivider = ({ className = "text-arena-oscura" }: { className?: string }) => {
  return (
    <div className={`w-full py-4 flex items-center justify-center overflow-hidden ${className}`}>
      <div className="flex-grow h-[1px] bg-current opacity-30"></div>
      <div className="mx-4 flex space-x-1 text-current opacity-70">
        <svg width="24" height="12" viewBox="0 0 24 12" fill="none" className="transform -rotate-90">
          <path d="M12 0 L24 12 L0 12 Z" fill="currentColor" />
        </svg>
        <svg width="24" height="12" viewBox="0 0 24 12" fill="none">
          <path d="M12 0 L24 12 L0 12 Z" fill="currentColor" />
        </svg>
        <svg width="24" height="12" viewBox="0 0 24 12" fill="none" className="transform rotate-90">
          <path d="M12 0 L24 12 L0 12 Z" fill="currentColor" />
        </svg>
      </div>
      <div className="flex-grow h-[1px] bg-current opacity-30"></div>
    </div>
  );
};
