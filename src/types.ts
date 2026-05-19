
export interface Product {
  name: string;
  description: string;
  bestFor: string;
  link: string;
}

export interface Symptom {
  name: string;
  description: string;
}

export interface Condition {
  id: string;
  title: string;
  shortDesc: string;
  fullDesc: string;
  whatIsIt: string;
  causes: string[];
  symptoms: Symptom[];
  diySupport: string[];
  products: Product[];
  painType: string[];
  affectedArea: string[];
}
