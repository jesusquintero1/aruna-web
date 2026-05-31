import React from "react";
import {
  ColibriIcon,
  FlamencoIcon,
  CardenalIcon,
  CactusIcon,
  LirioIcon,
  DelfinIcon
} from "@/components/FaunaFloraIcons";

export interface SimboloDetalle {
  name: string;
  wayuu: string;
  meaning: string;
  tag: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
  class: string;
}

export const simbolosData: Record<string, SimboloDetalle> = {
  colibri: {
    name: "Colibrí",
    wayuu: "Jalala'irü",
    meaning: "Mensajero celestial de la lluvia y portador de los sueños de primavera.",
    tag: "Viento & Cambio",
    icon: ColibriIcon,
    color: "#e77b88",
    class: "text-flamingo"
  },
  flamenco: {
    name: "Flamenco",
    wayuu: "Chogogo",
    meaning: "Símbolo de elegancia, comunidad y la belleza indómita de los lagos de sal.",
    tag: "Elegancia & Unión",
    icon: FlamencoIcon,
    color: "#e77b88",
    class: "text-flamingo"
  },
  cardenal: {
    name: "Cardenal",
    wayuu: "Isho",
    meaning: "La llama del desierto. Encarna la pasión y el canto vital del sol.",
    tag: "Fuerza & Pasión",
    icon: CardenalIcon,
    color: "#b85a38",
    class: "text-terracotta"
  },
  cactus: {
    name: "Iguaraya",
    wayuu: "Yosu",
    meaning: "El cactus Cardón guardián. Su fruto y raíces representan la resiliencia.",
    tag: "Resiliencia & Vida",
    icon: CactusIcon,
    color: "#3d643e",
    class: "text-cactus"
  },
  lirios: {
    name: "Lirios y Peonías",
    wayuu: "Kasutai",
    meaning: "Flores efímeras del desierto que florecen tras lluvias repentinas.",
    tag: "Renacimiento",
    icon: LirioIcon,
    color: "#8e44ad",
    class: "text-purple"
  },
  delfines: {
    name: "Delfines",
    wayuu: "Kala'upale",
    meaning: "Guardianes sagrados marinos de las almas viajeras en el Cabo de la Vela.",
    tag: "Guía & Libertad",
    icon: DelfinIcon,
    color: "#1f8a94",
    class: "text-caribe"
  }
};
