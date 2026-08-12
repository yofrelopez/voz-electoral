export type NivelGeografico = {
  departamento?: string;
  provincia?: string;
  distrito?: string;
  cargo: string;
};

export type TriviaOption = {
  id: number;
  nombre: string;
  partido: string;
  foto: string | null;
  isCorrect: boolean;
  fact: string;
};

export type TriviaQuestionType = "patrimonio" | "sentencias" | "educacion" | "juventud" | "transfugas" | "profesionales" | "jovenes" | "reeleccion";

export type TriviaQuestion = {
  id: string;
  type: TriviaQuestionType;
  question: string;
  options: TriviaOption[];
};
