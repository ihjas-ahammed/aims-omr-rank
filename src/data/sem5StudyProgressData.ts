// Semester 5 Calicut University FYUGP Syllabus Data
// Complete curriculum structures for Mathematics & Physics Honours

export interface Sem5TopicDef {
  id: string;
  code: string;
  title: string;
  unitNumber?: number;
}

export interface Sem5ModuleDef {
  id: string;
  number: number;
  title: string;
  topics: Sem5TopicDef[];
}

export interface Sem5CourseDef {
  id: string;
  code: string;
  title: string;
  subject: 'mathematics' | 'physics';
  type: 'core' | 'elective' | 'sec';
  textbook?: string;
  modules: Sem5ModuleDef[];
}

export const SEM5_SYLLABUS_DATA: Sem5CourseDef[] = [
  // =========================================================================
  // MATHEMATICS HONOURS
  // =========================================================================
  {
    id: "mat5cj301",
    code: "MAT5CJ301",
    title: "Real Analysis II",
    subject: "mathematics",
    type: "core",
    textbook: "Introduction to Real Analysis (4th Edition), Robert G. Bartle & Donald R. Sherbert, John Wiley & Sons (2011)",
    modules: [
      {
        id: "mat5cj301_m1",
        number: 1,
        title: "Continuous Functions",
        topics: [
          { id: "mat5cj301_m1_u1", code: "Unit 1", unitNumber: 1, title: "Section 5.1: Continuous Functions" },
          { id: "mat5cj301_m1_u2", code: "Unit 2", unitNumber: 2, title: "Section 5.3: Continuous Functions on Intervals (5.3.1 to 5.3.5)" },
          { id: "mat5cj301_m1_u3", code: "Unit 3", unitNumber: 3, title: "Section 5.3: Continuous Functions on Intervals (5.3.7 to 5.3.10)" },
          { id: "mat5cj301_m1_u4", code: "Unit 4", unitNumber: 4, title: "Section 5.4: Uniform Continuity (up to 5.4.3)" },
          { id: "mat5cj301_m1_u5", code: "Unit 5", unitNumber: 5, title: "Section 5.4: Uniform Continuity (5.4.4 to 5.4.14, proof of Weierstrass Approximation Theorem is optional)" },
          { id: "mat5cj301_m1_u6", code: "Unit 6", unitNumber: 6, title: "Selected Problems from Continuous Functions Sections" }
        ]
      },
      {
        id: "mat5cj301_m2",
        number: 2,
        title: "Differentiation",
        topics: [
          { id: "mat5cj301_m2_u7", code: "Unit 7", unitNumber: 7, title: "Section 6.1: The Derivative (6.1.1 to 6.1.7)" },
          { id: "mat5cj301_m2_u8", code: "Unit 8", unitNumber: 8, title: "Section 6.2: The Mean Value Theorem (6.2.1 to 6.2.6)" },
          { id: "mat5cj301_m2_u9", code: "Unit 9", unitNumber: 9, title: "Section 6.2: The Mean Value Theorem (from 6.2.7 to 6.2.9)" },
          { id: "mat5cj301_m2_u10", code: "Unit 10", unitNumber: 10, title: "Section 6.2: The Mean Value Theorem (6.2.10 to 6.2.13)" },
          { id: "mat5cj301_m2_u11", code: "Unit 11", unitNumber: 11, title: "Selected Problems from Differentiation Sections" }
        ]
      },
      {
        id: "mat5cj301_m3",
        number: 3,
        title: "The Riemann Integral",
        topics: [
          { id: "mat5cj301_m3_u12", code: "Unit 12", unitNumber: 12, title: "Section 7.1: Riemann Integral (up to 7.1.4 (a))" },
          { id: "mat5cj301_m3_u13", code: "Unit 13", unitNumber: 13, title: "Section 7.1: Riemann Integral (from 7.1.5 to 7.1.7, proof of 7.1.7 optional)" },
          { id: "mat5cj301_m3_u14", code: "Unit 14", unitNumber: 14, title: "Section 7.2: Riemann Integrable Functions (7.2.1 to 7.2.5, Examples 7.2.2 optional)" },
          { id: "mat5cj301_m3_u15", code: "Unit 15", unitNumber: 15, title: "Section 7.2: Riemann Integrable Functions (from 7.2.7 to 7.2.13)" },
          { id: "mat5cj301_m3_u16", code: "Unit 16", unitNumber: 16, title: "Section 7.3: The Fundamental Theorem of Calculus (7.3.1 to 7.3.7)" },
          { id: "mat5cj301_m3_u17", code: "Unit 17", unitNumber: 17, title: "Section 7.3: The Fundamental Theorem (7.3.8 to 7.3.18, proof of 7.3.18 optional)" },
          { id: "mat5cj301_m3_u18", code: "Unit 18", unitNumber: 18, title: "Selected Problems from The Riemann Integral Sections" }
        ]
      },
      {
        id: "mat5cj301_m4",
        number: 4,
        title: "Sequences and Series of Functions",
        topics: [
          { id: "mat5cj301_m4_u19", code: "Unit 19", unitNumber: 19, title: "Section 8.1: Pointwise and Uniform Convergence (8.1.1 to 8.1.3)" },
          { id: "mat5cj301_m4_u20", code: "Unit 20", unitNumber: 20, title: "Section 8.1: Pointwise and Uniform Convergence (from 8.1.4 to 8.1.10)" },
          { id: "mat5cj301_m4_u21", code: "Unit 21", unitNumber: 21, title: "Section 8.2: Interchange of Limits (8.2.1)" },
          { id: "mat5cj301_m4_u22", code: "Unit 22", unitNumber: 22, title: "Section 8.2: Interchange of Limit and Continuity (8.2.2)" }
        ]
      },
      {
        id: "mat5cj301_m5",
        number: 5,
        title: "Practicum (Self-Study & Seminars)",
        topics: [
          { id: "mat5cj301_m5_u1", code: "P1", unitNumber: 1, title: "Section 5.2: Combinations of Continuous Functions" },
          { id: "mat5cj301_m5_u2", code: "P2", unitNumber: 2, title: "Section 5.6: Continuous Functions (from 5.6.5 to 5.6.7)" },
          { id: "mat5cj301_m5_u3", code: "P3", unitNumber: 3, title: "Section 6.1: Inverse Functions (6.1.8 to 6.1.10)" },
          { id: "mat5cj301_m5_u4", code: "P4", unitNumber: 4, title: "Section 6.3: L'Hospital's Rule (from 6.3.5 to 6.3.7)" },
          { id: "mat5cj301_m5_u5", code: "P5", unitNumber: 5, title: "Section 6.4: Taylor's Theorem (6.4.1 to 6.4.4)" },
          { id: "mat5cj301_m5_u6", code: "P6", unitNumber: 6, title: "Section 8.2: Interchange of Limits (8.2.3 and 8.2.4)" },
          { id: "mat5cj301_m5_u7", code: "P7", unitNumber: 7, title: "Section 9.1: Absolute Convergence (9.1.1 to 9.1.3)" },
          { id: "mat5cj301_m5_u8", code: "P8", unitNumber: 8, title: "Section 9.1: Absolute Convergence (9.1.4 to 9.1.5)" },
          { id: "mat5cj301_m5_u9", code: "P9", unitNumber: 9, title: "Section 9.2: Limit Comparison Test with Examples" },
          { id: "mat5cj301_m5_u10", code: "P10", unitNumber: 10, title: "Section 9.2: Root Test with Examples" },
          { id: "mat5cj301_m5_u11", code: "P11", unitNumber: 11, title: "Section 9.2: Ratio Test with Examples" },
          { id: "mat5cj301_m5_u12", code: "P12", unitNumber: 12, title: "Section 9.2: Integral Test with Examples" },
          { id: "mat5cj301_m5_u13", code: "P13", unitNumber: 13, title: "Section 9.2: Raabe's Test with Examples" },
          { id: "mat5cj301_m5_u14", code: "P14", unitNumber: 14, title: "Section 9.3: Alternating Series Test" },
          { id: "mat5cj301_m5_u15", code: "P15", unitNumber: 15, title: "Section 9.4: Infinite Series – Series of Functions (9.4.1 to 9.4.7)" }
        ]
      }
    ]
  },
  {
    id: "mat5cj302",
    code: "MAT5CJ302",
    title: "Abstract Algebra I",
    subject: "mathematics",
    type: "core",
    textbook: "A First Course in Abstract Algebra (7th Edition), John B. Fraleigh, Pearson Education India (2003)",
    modules: [
      {
        id: "mat5cj302_m1",
        number: 1,
        title: "Binary Operations & Groups",
        topics: [
          { id: "mat5cj302_m1_u1", code: "Unit 1", unitNumber: 1, title: "Section 2: Binary Operations (2.1 to 2.10)" },
          { id: "mat5cj302_m1_u2", code: "Unit 2", unitNumber: 2, title: "Section 2: Binary Operations (2.11 to 2.25)" },
          { id: "mat5cj302_m1_u3", code: "Unit 3", unitNumber: 3, title: "Section 3: Isomorphic Binary Structures (3.1 to 3.11)" },
          { id: "mat5cj302_m1_u4", code: "Unit 4", unitNumber: 4, title: "Section 3: Isomorphic Binary Structures (3.12 to 3.17)" },
          { id: "mat5cj302_m1_u5", code: "Unit 5", unitNumber: 5, title: "Section 4: Groups (4.1 to 4.14)" },
          { id: "mat5cj302_m1_u6", code: "Unit 6", unitNumber: 6, title: "Section 4: Groups – Elementary Properties of Groups, Finite Groups and Group Tables (4.15 onwards)" }
        ]
      },
      {
        id: "mat5cj302_m2",
        number: 2,
        title: "Subgroups, Cyclic Groups & Permutations",
        topics: [
          { id: "mat5cj302_m2_u7", code: "Unit 7", unitNumber: 7, title: "Section 5: Subgroups (5.1 to 5.16)" },
          { id: "mat5cj302_m2_u8", code: "Unit 8", unitNumber: 8, title: "Section 5: Subgroup – Cyclic Subgroups (5.17 to 5.23)" },
          { id: "mat5cj302_m2_u9", code: "Unit 9", unitNumber: 9, title: "Section 6: Cyclic Groups (6.1 to 6.9, proof of Theorem 6.3 optional)" },
          { id: "mat5cj302_m2_u10", code: "Unit 10", unitNumber: 10, title: "Section 6: Cyclic Groups (6.10 to 6.17, proof of Theorem 6.14 optional)" },
          { id: "mat5cj302_m2_u11", code: "Unit 11", unitNumber: 11, title: "Section 8: Groups of Permutations (up to 8.6)" },
          { id: "mat5cj302_m2_u12", code: "Unit 12", unitNumber: 12, title: "Section 8: Groups of Permutations (8.7 to 8.18)" }
        ]
      },
      {
        id: "mat5cj302_m3",
        number: 3,
        title: "Orbits, Cycles, Alternating Groups & Cosets",
        topics: [
          { id: "mat5cj302_m3_u13", code: "Unit 13", unitNumber: 13, title: "Section 9: Orbits, Cycles, and the Alternating Groups (Up to 9.10)" },
          { id: "mat5cj302_m3_u14", code: "Unit 14", unitNumber: 14, title: "Section 9: Orbits, Cycles, and the Alternating Groups (9.11 to 9.21, proof 2 of 9.15 optional)" },
          { id: "mat5cj302_m3_u15", code: "Unit 15", unitNumber: 15, title: "Section 10: Cosets and the Theorem of Lagrange (Up to 10.9)" },
          { id: "mat5cj302_m3_u16", code: "Unit 16", unitNumber: 16, title: "Section 10: Cosets and the Theorem of Lagrange (10.10 to 10.14)" }
        ]
      },
      {
        id: "mat5cj302_m4",
        number: 4,
        title: "Homomorphisms, Rings & Integral Domains",
        topics: [
          { id: "mat5cj302_m4_u17", code: "Unit 17", unitNumber: 17, title: "Section 13: Homomorphisms (13.1 to 13.10)" },
          { id: "mat5cj302_m4_u18", code: "Unit 18", unitNumber: 18, title: "Section 13: Homomorphisms (13.11 to 13.20)" },
          { id: "mat5cj302_m4_u19", code: "Unit 19", unitNumber: 19, title: "Section 18: Rings and Fields (18.1 to 18.13)" },
          { id: "mat5cj302_m4_u20", code: "Unit 20", unitNumber: 20, title: "Section 18: Rings and Fields (18.14 to 18.18)" },
          { id: "mat5cj302_m4_u21", code: "Unit 21", unitNumber: 21, title: "Section 19: Integral Domains (19.1 to 19.8)" },
          { id: "mat5cj302_m4_u22", code: "Unit 22", unitNumber: 22, title: "Section 19: Integral Domains (19.9 to 19.15)" }
        ]
      },
      {
        id: "mat5cj302_m5",
        number: 5,
        title: "Open Ended Module",
        topics: [
          { id: "mat5cj302_m5_u1", code: "OE1", unitNumber: 1, title: "Generating Sets in Groups" },
          { id: "mat5cj302_m5_u2", code: "OE2", unitNumber: 2, title: "Factor Groups" },
          { id: "mat5cj302_m5_u3", code: "OE3", unitNumber: 3, title: "The Field of Quotients of an Integral Domain" },
          { id: "mat5cj302_m5_u4", code: "OE4", unitNumber: 4, title: "SageMath Programming Exercises: Congruence Groups, Permutation Groups S3, Dihedral Group D4 & Cyclic Groups" }
        ]
      }
    ]
  },
  {
    id: "mat5cj303",
    code: "MAT5CJ303",
    title: "Complex Analysis I",
    subject: "mathematics",
    type: "core",
    textbook: "Complex Analysis (3rd Edition), Dennis G. Zill & Patric D. Shanahan, Jones & Bartlett Learning (2018)",
    modules: [
      {
        id: "mat5cj303_m1",
        number: 1,
        title: "Complex Numbers & Plane",
        topics: [
          { id: "mat5cj303_m1_u1", code: "Unit 1", unitNumber: 1, title: "Section 1.1: Complex Numbers and Their Properties" },
          { id: "mat5cj303_m1_u2", code: "Unit 2", unitNumber: 2, title: "Section 1.2: Complex Plane" },
          { id: "mat5cj303_m1_u3", code: "Unit 3", unitNumber: 3, title: "Section 1.3: Polar Form of Complex Numbers" },
          { id: "mat5cj303_m1_u4", code: "Unit 4", unitNumber: 4, title: "Section 1.4: Powers and Roots" },
          { id: "mat5cj303_m1_u5", code: "Unit 5", unitNumber: 5, title: "Section 1.5: Sets of Points in Complex Plane" }
        ]
      },
      {
        id: "mat5cj303_m2",
        number: 2,
        title: "Complex Functions & Power Functions",
        topics: [
          { id: "mat5cj303_m2_u6", code: "Unit 6", unitNumber: 6, title: "Section 2.1: Complex Functions" },
          { id: "mat5cj303_m2_u7", code: "Unit 7", unitNumber: 7, title: "Section 2.2: Complex Functions as Mappings (up to and including Example 4)" },
          { id: "mat5cj303_m2_u8", code: "Unit 8", unitNumber: 8, title: "Section 2.4: Special Power Functions – The Power Function z^n (All topics in 2.4.1)" },
          { id: "mat5cj303_m2_u9", code: "Unit 9", unitNumber: 9, title: "Section 2.4: Special Power Functions – The Power Function z^(1/n) (Topics in 2.4.2 up to Example 5)" },
          { id: "mat5cj303_m2_u10", code: "Unit 10", unitNumber: 10, title: "Section 2.4: Special Power Functions – Principal nth Root Functions and Example 9" }
        ]
      },
      {
        id: "mat5cj303_m3",
        number: 3,
        title: "Limits, Analyticity & Cauchy-Riemann Equations",
        topics: [
          { id: "mat5cj303_m3_u11", code: "Unit 11", unitNumber: 11, title: "Section 3.1: Limits and Continuity – Limits (All topics in 3.1.1)" },
          { id: "mat5cj303_m3_u12", code: "Unit 12", unitNumber: 12, title: "Section 3.1: Limits and Continuity – Continuity (Topics in 3.1.2 up to Example 7)" },
          { id: "mat5cj303_m3_u13", code: "Unit 13", unitNumber: 13, title: "Section 3.1: Limits and Continuity – Continuity (Theorem 3.1.4 up to bounding property)" },
          { id: "mat5cj303_m3_u14", code: "Unit 14", unitNumber: 14, title: "Section 3.2: Differentiability and Analyticity (up to and including Example 2)" },
          { id: "mat5cj303_m3_u15", code: "Unit 15", unitNumber: 15, title: "Section 3.2: Differentiability and Analyticity (All topics after Example 2)" },
          { id: "mat5cj303_m3_u16", code: "Unit 16", unitNumber: 16, title: "Section 3.3: Cauchy-Riemann Equations (up to and including Theorem 3.3.2)" },
          { id: "mat5cj303_m3_u17", code: "Unit 17", unitNumber: 17, title: "Section 3.3: Cauchy-Riemann Equations (All topics after Theorem 3.3.2)" },
          { id: "mat5cj303_m3_u18", code: "Unit 18", unitNumber: 18, title: "Section 3.4: Harmonic Functions" }
        ]
      },
      {
        id: "mat5cj303_m4",
        number: 4,
        title: "Elementary Complex Functions",
        topics: [
          { id: "mat5cj303_m4_u19", code: "Unit 19", unitNumber: 19, title: "Section 4.1: Complex Exponential Function (Topics in 4.1.1 up to Periodicity)" },
          { id: "mat5cj303_m4_u20", code: "Unit 20", unitNumber: 20, title: "Section 4.1: Complex Logarithmic Function (Topics in 4.1.2 up to Example 4)" },
          { id: "mat5cj303_m4_u21", code: "Unit 21", unitNumber: 21, title: "Section 4.3: Complex Trigonometric Functions (Topics in 4.3.1 up to trigonometric mapping)" },
          { id: "mat5cj303_m4_u22", code: "Unit 22", unitNumber: 22, title: "Section 4.3: Complex Hyperbolic Functions (All topics in 4.3.2)" }
        ]
      },
      {
        id: "mat5cj303_m5",
        number: 5,
        title: "Open Ended Module",
        topics: [
          { id: "mat5cj303_m5_u1", code: "OE1", unitNumber: 1, title: "Linear Mappings & Reciprocal Functions" },
          { id: "mat5cj303_m5_u2", code: "OE2", unitNumber: 2, title: "Branches, Branch Cuts and Points, Complex Powers" },
          { id: "mat5cj303_m5_u3", code: "OE3", unitNumber: 3, title: "Inverse Trigonometric and Hyperbolic Functions" }
        ]
      }
    ]
  },
  {
    id: "mat5ej301",
    code: "MAT5EJ301(1)",
    title: "Mathematical Foundations of Computing",
    subject: "mathematics",
    type: "elective",
    textbook: "Invitation to Discrete Mathematics (2nd Ed), J. Matousek & J. Nesetril & Introduction to Graph Theory (4th Ed), Robin J. Wilson",
    modules: [
      {
        id: "mat5ej301_m1",
        number: 1,
        title: "Combinatorial Counting",
        topics: [
          { id: "mat5ej301_m1_u1", code: "Unit 1", unitNumber: 1, title: "Section 1.1: An Assortment of Problems" },
          { id: "mat5ej301_m1_u2", code: "Unit 2", unitNumber: 2, title: "Section 1.3: Mathematical Induction (Proof of Theorem 1.3.1 optional)" },
          { id: "mat5ej301_m1_u3", code: "Unit 3", unitNumber: 3, title: "Section 1.5: Relations, Section 1.6: Equivalences and Other Special Types of Relations" },
          { id: "mat5ej301_m1_u4", code: "Unit 4", unitNumber: 4, title: "Section 3.1: Functions and Subsets, Section 3.2: Permutations and Factorials" },
          { id: "mat5ej301_m1_u5", code: "Unit 5", unitNumber: 5, title: "Section 3.3: Binomial Coefficients" },
          { id: "mat5ej301_m1_u6", code: "Unit 6", unitNumber: 6, title: "Section 3.7: Inclusion-Exclusion Principle (Third proof of 3.7.2 optional)" }
        ]
      },
      {
        id: "mat5ej301_m2",
        number: 2,
        title: "Basics of Graph Theory",
        topics: [
          { id: "mat5ej301_m2_u7", code: "Unit 7", unitNumber: 7, title: "Section 4.1: The Notion of a Graph; Isomorphism" },
          { id: "mat5ej301_m2_u8", code: "Unit 8", unitNumber: 8, title: "Section 4.2: Subgraphs, Components, Adjacency Matrix" },
          { id: "mat5ej301_m2_u9", code: "Unit 9", unitNumber: 9, title: "Section 4.3: Graph Score (Proof of Theorem 4.3.3 optional)" },
          { id: "mat5ej301_m2_u10", code: "Unit 10", unitNumber: 10, title: "Section 4.4: Eulerian Graphs (Second proof of 4.4.1 and lemma 4.4.2 optional)" },
          { id: "mat5ej301_m2_u11", code: "Unit 11", unitNumber: 11, title: "Section 4.5: Eulerian Directed Graph" },
          { id: "mat5ej301_m2_u12", code: "Unit 12", unitNumber: 12, title: "Section 5.1: Definition and Characterizations of Trees" }
        ]
      },
      {
        id: "mat5ej301_m3",
        number: 3,
        title: "Matching and Colouring",
        topics: [
          { id: "mat5ej301_m3_u13", code: "Unit 13", unitNumber: 13, title: "Section 12: Planar Graphs (Proof of Theorem 12.2 and 12.3 optional)" },
          { id: "mat5ej301_m3_u14", code: "Unit 14", unitNumber: 14, title: "Section 13: Euler's Formula (up to Corollary 13.4)" },
          { id: "mat5ej301_m3_u15", code: "Unit 15", unitNumber: 15, title: "Section 13: Euler's Formula (from Corollary 13.4)" },
          { id: "mat5ej301_m3_u16", code: "Unit 16", unitNumber: 16, title: "Section 17: Coloring Graphs" },
          { id: "mat5ej301_m3_u17", code: "Unit 17", unitNumber: 17, title: "Section 19: Coloring Maps (Proof of Theorem 19.2 and 19.4 optional)" },
          { id: "mat5ej301_m3_u18", code: "Unit 18", unitNumber: 18, title: "Section 25: Hall's Marriage Theorem" }
        ]
      },
      {
        id: "mat5ej301_m4",
        number: 4,
        title: "Probabilistic Method",
        topics: [
          { id: "mat5ej301_m4_u19", code: "Unit 19", unitNumber: 19, title: "Section 10.1: Proofs by Counting (2-Coloring revisited, optional)" },
          { id: "mat5ej301_m4_u20", code: "Unit 20", unitNumber: 20, title: "Section 10.2: Finite Probability Spaces (up to Random Graphs)" },
          { id: "mat5ej301_m4_u21", code: "Unit 21", unitNumber: 21, title: "Section 10.2: Finite Probability Spaces (from Random Graphs)" },
          { id: "mat5ej301_m4_u22", code: "Unit 22", unitNumber: 22, title: "Section 10.3: Random Variables and Their Expectations" }
        ]
      },
      {
        id: "mat5ej301_m5",
        number: 5,
        title: "Open Ended Module",
        topics: [
          { id: "mat5ej301_m5_u1", code: "OE1", unitNumber: 1, title: "Hamiltonian Graphs, 2-Connectivity & Ramsey Theory" },
          { id: "mat5ej301_m5_u2", code: "OE2", unitNumber: 2, title: "Generating Functions, Simulating Random Experiments in Python & Brooks' Theorem" }
        ]
      }
    ]
  },
  {
    id: "mat5ej302",
    code: "MAT5EJ302(1)",
    title: "Data Structures and Algorithms",
    subject: "mathematics",
    type: "elective",
    textbook: "Algorithms, Sanjoy Dasgupta, Christos H. Papadimitriou, Umesh Vazirani, McGraw-Hill (2006)",
    modules: [
      {
        id: "mat5ej302_m1",
        number: 1,
        title: "Introduction & Numerical Algorithms",
        topics: [
          { id: "mat5ej302_m1_u1", code: "Unit 1", unitNumber: 1, title: "Computing Fibonacci Numbers: Exponential and Polynomial Algorithms" },
          { id: "mat5ej302_m1_u2", code: "Unit 2", unitNumber: 2, title: "Efficiency of Algorithms: Asymptotic Analysis, Big-O Notation" },
          { id: "mat5ej302_m1_u3", code: "Unit 3", unitNumber: 3, title: "Algorithms with Numbers: Efficiency of Classical Addition and Multiplication Algorithms" },
          { id: "mat5ej302_m1_u4", code: "Unit 4", unitNumber: 4, title: "Algorithms for Modular Arithmetic" },
          { id: "mat5ej302_m1_u5", code: "Unit 5", unitNumber: 5, title: "Euclid's Algorithm for GCD" },
          { id: "mat5ej302_m1_u6", code: "Unit 6", unitNumber: 6, title: "Primality Testing" }
        ]
      },
      {
        id: "mat5ej302_m2",
        number: 2,
        title: "Divide and Conquer & Graph Search",
        topics: [
          { id: "mat5ej302_m2_u7", code: "Unit 7", unitNumber: 7, title: "Fast Integer Multiplication" },
          { id: "mat5ej302_m2_u8", code: "Unit 8", unitNumber: 8, title: "Recursive Relations" },
          { id: "mat5ej302_m2_u9", code: "Unit 9", unitNumber: 9, title: "Binary Search" },
          { id: "mat5ej302_m2_u10", code: "Unit 10", unitNumber: 10, title: "Merge Sort" },
          { id: "mat5ej302_m2_u11", code: "Unit 11", unitNumber: 11, title: "Graph Representations: Adjacency Matrix, Adjacency List" },
          { id: "mat5ej302_m2_u12", code: "Unit 12", unitNumber: 12, title: "Depth First Search in Undirected Graphs" },
          { id: "mat5ej302_m2_u13", code: "Unit 13", unitNumber: 13, title: "Depth First Search in Directed Graphs" }
        ]
      },
      {
        id: "mat5ej302_m3",
        number: 3,
        title: "Graph Algorithms & Shortest Paths",
        topics: [
          { id: "mat5ej302_m3_u14", code: "Unit 14", unitNumber: 14, title: "Checking Connectivity" },
          { id: "mat5ej302_m3_u15", code: "Unit 15", unitNumber: 15, title: "Directed Acyclic Graphs, Strongly Connected Components" },
          { id: "mat5ej302_m3_u16", code: "Unit 16", unitNumber: 16, title: "Breadth First Search and Computation of Distances" },
          { id: "mat5ej302_m3_u17", code: "Unit 17", unitNumber: 17, title: "Weighted Graphs and Dijkstra's Algorithm" },
          { id: "mat5ej302_m3_u18", code: "Unit 18", unitNumber: 18, title: "Priority Queue Implementations" },
          { id: "mat5ej302_m3_u19", code: "Unit 19", unitNumber: 19, title: "Shortest Paths in Directed Acyclic Graphs" }
        ]
      },
      {
        id: "mat5ej302_m4",
        number: 4,
        title: "Greedy & Dynamic Programming Algorithms",
        topics: [
          { id: "mat5ej302_m4_u20", code: "Unit 20", unitNumber: 20, title: "Minimum Spanning Trees: Cut Property" },
          { id: "mat5ej302_m4_u21", code: "Unit 21", unitNumber: 21, title: "Kruskal's Algorithm" },
          { id: "mat5ej302_m4_u22", code: "Unit 22", unitNumber: 22, title: "Data Structure for Disjoint Sets" },
          { id: "mat5ej302_m4_u23", code: "Unit 23", unitNumber: 23, title: "Prim's Algorithm" },
          { id: "mat5ej302_m4_u24", code: "Unit 24", unitNumber: 24, title: "Dynamic Programming and Shortest Path in Directed Acyclic Graphs (DAG)" },
          { id: "mat5ej302_m4_u25", code: "Unit 25", unitNumber: 25, title: "All Pairs of Shortest Paths and Floyd Warshall Algorithm" }
        ]
      },
      {
        id: "mat5ej302_m5",
        number: 5,
        title: "Advanced Topics (Python Implementations)",
        topics: [
          { id: "mat5ej302_m5_u27", code: "Unit 27", unitNumber: 27, title: "Python Implementation: Fibonacci Numbers, Extended Euclid, Primality Testing, DFS/BFS Connectivity & Dijkstra's Algorithm" }
        ]
      }
    ]
  },
  {
    id: "mat5ej303",
    code: "MAT5EJ303(2)",
    title: "Convex Optimization",
    subject: "mathematics",
    type: "elective",
    textbook: "Mathematical Analysis (2nd Ed), K.G. Binmore & Convex Optimization, Stephen Boyd and Lieven Vandenberghe, Cambridge University Press (2004)",
    modules: [
      {
        id: "mat5ej303_m1",
        number: 1,
        title: "Review of Multivariable Calculus",
        topics: [
          { id: "mat5ej303_m1_u1", code: "Unit 1", unitNumber: 1, title: "Scalar and Vector Fields - Directional and Partial Derivatives" },
          { id: "mat5ej303_m1_u2", code: "Unit 2", unitNumber: 2, title: "Differentiable Functions and Total Derivative – Matrix Representation, Gradient and Jacobian" },
          { id: "mat5ej303_m1_u3", code: "Unit 3", unitNumber: 3, title: "Chain Rule for Differentiation – Matrix Form" },
          { id: "mat5ej303_m1_u4", code: "Unit 4", unitNumber: 4, title: "Stationary Points – Conditions for Stationarity" },
          { id: "mat5ej303_m1_u5", code: "Unit 5", unitNumber: 5, title: "Second Derivatives and Hessian Matrix" },
          { id: "mat5ej303_m1_u6", code: "Unit 6", unitNumber: 6, title: "Mean Value Theorems, Second Order Taylor's Theorem" },
          { id: "mat5ej303_m1_u7", code: "Unit 7", unitNumber: 7, title: "Eigenvalues of Hessian" },
          { id: "mat5ej303_m1_u8", code: "Unit 8", unitNumber: 8, title: "Classification of Stationary Points" }
        ]
      },
      {
        id: "mat5ej303_m2",
        number: 2,
        title: "Convexity",
        topics: [
          { id: "mat5ej303_m2_u9", code: "Unit 9", unitNumber: 9, title: "Affine and Convex Sets" },
          { id: "mat5ej303_m2_u10", code: "Unit 10", unitNumber: 10, title: "Convexity Preserving Operations on Sets" },
          { id: "mat5ej303_m2_u11", code: "Unit 11", unitNumber: 11, title: "Generalized Inequalities" },
          { id: "mat5ej303_m2_u12", code: "Unit 12", unitNumber: 12, title: "Supporting and Separating Hyperplanes" },
          { id: "mat5ej303_m2_u13", code: "Unit 13", unitNumber: 13, title: "Dual Cones and Generalized Inequality" },
          { id: "mat5ej303_m2_u14", code: "Unit 14", unitNumber: 14, title: "Basic Properties and Examples of Convex Functions" },
          { id: "mat5ej303_m2_u15", code: "Unit 15", unitNumber: 15, title: "Convexity Preserving Operations on Functions" },
          { id: "mat5ej303_m2_u16", code: "Unit 16", unitNumber: 16, title: "Quasi-Convex and Log-Convex Functions" },
          { id: "mat5ej303_m2_u17", code: "Unit 17", unitNumber: 17, title: "Convexity and Generalized Inequalities" }
        ]
      },
      {
        id: "mat5ej303_m3",
        number: 3,
        title: "Convex Optimization Problems",
        topics: [
          { id: "mat5ej303_m3_u18", code: "Unit 18", unitNumber: 18, title: "Optimization Problems and Convex Optimization" },
          { id: "mat5ej303_m3_u19", code: "Unit 19", unitNumber: 19, title: "Linear Optimization Problems" },
          { id: "mat5ej303_m3_u20", code: "Unit 20", unitNumber: 20, title: "Quadratic Optimization Problems" },
          { id: "mat5ej303_m3_u21", code: "Unit 21", unitNumber: 21, title: "Geometric Programming" },
          { id: "mat5ej303_m3_u22", code: "Unit 22", unitNumber: 22, title: "Generalized Inequality Constraints & Vector Optimization" }
        ]
      },
      {
        id: "mat5ej303_m4",
        number: 4,
        title: "Duality",
        topics: [
          { id: "mat5ej303_m4_u23", code: "Unit 20", unitNumber: 20, title: "The Lagrange Dual Function" },
          { id: "mat5ej303_m4_u24", code: "Unit 21", unitNumber: 21, title: "The Lagrangian Dual and Geometric Interpretation" },
          { id: "mat5ej303_m4_u25", code: "Unit 22", unitNumber: 22, title: "Saddle Point Interpretation & Optimality Conditions" },
          { id: "mat5ej303_m4_u26", code: "Unit 24", unitNumber: 24, title: "Theorems of Alternatives & Generalized Inequalities" }
        ]
      },
      {
        id: "mat5ej303_m5",
        number: 5,
        title: "Open Ended Module",
        topics: [
          { id: "mat5ej303_m5_u27", code: "Unit 27", unitNumber: 27, title: "Practical Problem Solving: Linear Classifiers, Support Vector Machines (SVM), Linear and Logistic Regression" }
        ]
      }
    ]
  },
  {
    id: "mat5ej305",
    code: "MAT5EJ305",
    title: "Higher Algebra",
    subject: "mathematics",
    type: "elective",
    textbook: "Theory of Equations, J.V. Uspensky, McGraw Hill (1948) & Geometry (2nd Ed), David A. Brannan et al., Cambridge University Press (2012)",
    modules: [
      {
        id: "mat5ej305_m1",
        number: 1,
        title: "Theory of Equations",
        topics: [
          { id: "mat5ej305_m1_u1", code: "Unit 1", unitNumber: 1, title: "Chapter II - Section 3: Division of Polynomials" },
          { id: "mat5ej305_m1_u2", code: "Unit 2", unitNumber: 2, title: "Chapter II - Section 4: The Remainder Theorem" },
          { id: "mat5ej305_m1_u3", code: "Unit 3", unitNumber: 3, title: "Chapter II - Section 5: Synthetic Division" },
          { id: "mat5ej305_m1_u4", code: "Unit 4", unitNumber: 4, title: "Chapter II - Section 7: Taylor's Formula" },
          { id: "mat5ej305_m1_u5", code: "Unit 5", unitNumber: 5, title: "Chapter III - Section 1: Algebraic Equations" },
          { id: "mat5ej305_m1_u6", code: "Unit 6", unitNumber: 6, title: "Chapter III - Section 2: Identity Theorem" },
          { id: "mat5ej305_m1_u7", code: "Unit 7", unitNumber: 7, title: "Chapter III - Section 3: The Fundamental Theorem of Algebra" }
        ]
      },
      {
        id: "mat5ej305_m2",
        number: 2,
        title: "Cubic And Biquadratic Equations",
        topics: [
          { id: "mat5ej305_m2_u8", code: "Unit 8", unitNumber: 8, title: "Chapter III - Section 4: Imaginary Roots of Equations with Real Coefficients" },
          { id: "mat5ej305_m2_u9", code: "Unit 9", unitNumber: 9, title: "Chapter III - Section 5: Relations Between Roots and Coefficients" },
          { id: "mat5ej305_m2_u10", code: "Unit 10", unitNumber: 10, title: "Chapter IV - Section 1: Limits of Roots, Section 2: Upper Limit of Positive Roots" },
          { id: "mat5ej305_m2_u11", code: "Unit 11", unitNumber: 11, title: "Chapter IV - Section 3: Limit for Moduli of Roots" },
          { id: "mat5ej305_m2_u12", code: "Unit 12", unitNumber: 12, title: "Chapter V - Section 1: Solution of an Equation, Section 2: Cardan's Formulas, Section 3: Discussion of Solution" },
          { id: "mat5ej305_m2_u13", code: "Unit 13", unitNumber: 13, title: "Chapter V - Section 4: Irreducible Case, Section 5: Trigonometric Solution" },
          { id: "mat5ej305_m2_u14", code: "Unit 14", unitNumber: 14, title: "Chapter V - Section 6: Solution of Biquadratic Equations" }
        ]
      },
      {
        id: "mat5ej305_m3",
        number: 3,
        title: "Conic Sections",
        topics: [
          { id: "mat5ej305_m3_u15", code: "Unit 15", unitNumber: 15, title: "Section 1.1.1: Conic Sections, Section 1.1.2: Circles" },
          { id: "mat5ej305_m3_u16", code: "Unit 16", unitNumber: 16, title: "Section 1.1.3: Focus-Directrix Definition of Non-Degenerate Conics" },
          { id: "mat5ej305_m3_u17", code: "Unit 17", unitNumber: 17, title: "Section 1.1.4: Focal Distance Properties of Ellipse and Hyperbola" },
          { id: "mat5ej305_m3_u18", code: "Unit 18", unitNumber: 18, title: "Section 1.1.5: Dandelin Spheres" }
        ]
      },
      {
        id: "mat5ej305_m4",
        number: 4,
        title: "Quadric Surfaces",
        topics: [
          { id: "mat5ej305_m4_u19", code: "Unit 19", unitNumber: 19, title: "Section 1.2.2: Reflections" },
          { id: "mat5ej305_m4_u20", code: "Unit 20", unitNumber: 20, title: "Section 1.3: Recognizing Conics" },
          { id: "mat5ej305_m4_u21", code: "Unit 21", unitNumber: 21, title: "Section 1.4.1: Quadric Surfaces in R^3" },
          { id: "mat5ej305_m4_u22", code: "Unit 22", unitNumber: 22, title: "Section 1.4.2: Recognizing Quadric Surfaces" }
        ]
      },
      {
        id: "mat5ej305_m5",
        number: 5,
        title: "Open Ended Module: Affine Maps",
        topics: [
          { id: "mat5ej305_m5_u1", code: "OE1", unitNumber: 1, title: "Geometry and Transformations – Euclidean Geometry, Isometry, Euclidean Properties & Congruence" },
          { id: "mat5ej305_m5_u2", code: "OE2", unitNumber: 2, title: "Affine Transformations & Basic Properties of Affine Transformations" },
          { id: "mat5ej305_m5_u3", code: "OE3", unitNumber: 3, title: "Fundamental Theorem of Affine Geometry" }
        ]
      }
    ]
  },
  {
    id: "mat5ej306",
    code: "MAT5EJ306",
    title: "Linear Programming",
    subject: "mathematics",
    type: "elective",
    textbook: "Optimization Methods in Operation Research and System Analysis (4th Ed), K.V. Mittal & C. Mohan, New Age International (2016)",
    modules: [
      {
        id: "mat5ej306_m1",
        number: 1,
        title: "Convex Sets and Polyhedra",
        topics: [
          { id: "mat5ej306_m1_u1", code: "Unit 1", unitNumber: 1, title: "Chapter 1 - Section 11: Open and Closed Sets in En" },
          { id: "mat5ej306_m1_u2", code: "Unit 2", unitNumber: 2, title: "Section 12: Convex Linear Combination, Convex Sets" },
          { id: "mat5ej306_m1_u3", code: "Unit 3", unitNumber: 3, title: "Section 13: Intersection of Convex Sets, Convex Hull, Section 14: Vertices / Extreme Points" },
          { id: "mat5ej306_m1_u4", code: "Unit 4", unitNumber: 4, title: "Section 15: Convex Polyhedron, Section 16: Hyperplanes, Half-Spaces and Polytopes" },
          { id: "mat5ej306_m1_u5", code: "Unit 5", unitNumber: 5, title: "Section 17: Separating and Supporting Hyperplanes, Section 18: Vertices of Closed Bounded Convex Set, Section 20: Quadratic Forms" }
        ]
      },
      {
        id: "mat5ej306_m2",
        number: 2,
        title: "Simplex Method & LP Formulation",
        topics: [
          { id: "mat5ej306_m2_u6", code: "Unit 6", unitNumber: 6, title: "Chapter 2 - Section 11: Convex Functions, Section 12: General Problem of Mathematical Programming" },
          { id: "mat5ej306_m2_u8", code: "Unit 8", unitNumber: 8, title: "Chapter 3 - Section 1: Introduction, Section 2: LP in Two-Dimensional Space" },
          { id: "mat5ej306_m2_u9", code: "Unit 9", unitNumber: 9, title: "Section 3: General LP Problem, Section 4-6: Feasible & Basic Solutions, Section 7: Optimal Solution" },
          { id: "mat5ej306_m2_u10", code: "Unit 10", unitNumber: 10, title: "Section 9: Simplex Method, Section 10: Canonical Form, Section 11-12: Simplex Tableau & Numerical Examples" },
          { id: "mat5ej306_m2_u11", code: "Unit 11", unitNumber: 11, title: "Section 13: Finding the First Basic Feasible Solution; Artificial Variables, Section 14: Degeneracy" },
          { id: "mat5ej306_m2_u12", code: "Unit 12", unitNumber: 12, title: "Section 15: Simplex Multipliers" }
        ]
      },
      {
        id: "mat5ej306_m3",
        number: 3,
        title: "Duality in Linear Programming",
        topics: [
          { id: "mat5ej306_m3_u13", code: "Unit 13", unitNumber: 13, title: "Chapter 3 - Section 17: Duality in LP Problems" },
          { id: "mat5ej306_m3_u14", code: "Unit 14", unitNumber: 14, title: "Section 18: Duality Theorems (Proof of Theorem 7,8,9, 10,11 optional), Section 19: Applications of Duality" },
          { id: "mat5ej306_m3_u15", code: "Unit 15", unitNumber: 15, title: "Section 20: Dual Simplex Method, Section 21: Summary of Simplex Methods (Revised Simplex optional)" },
          { id: "mat5ej306_m3_u16", code: "Unit 16", unitNumber: 16, title: "Section 22: Applications of LP" }
        ]
      },
      {
        id: "mat5ej306_m4",
        number: 4,
        title: "Transportation and Assignment Problems",
        topics: [
          { id: "mat5ej306_m4_u17", code: "Unit 17", unitNumber: 17, title: "Chapter 4 - Section 1-4: Introduction, Transportation Problem, Array & Matrix, Section 5-6: Initial BFS" },
          { id: "mat5ej306_m4_u18", code: "Unit 18", unitNumber: 18, title: "Section 7: Testing for Optimality (MODI / u-v Method)" },
          { id: "mat5ej306_m4_u19", code: "Unit 19", unitNumber: 19, title: "Section 8: Loop in Transportation Array, Section 9: Changing the Basis" },
          { id: "mat5ej306_m4_u20", code: "Unit 20", unitNumber: 20, title: "Section 10: Degeneracy, Section 11: Unbalanced Problem" },
          { id: "mat5ej306_m4_u21", code: "Unit 21", unitNumber: 21, title: "Section 14: Assignment Problem (Hungarian Method, proof optional)" },
          { id: "mat5ej306_m4_u22", code: "Unit 22", unitNumber: 22, title: "Section 15: Generalized Transportation Problem & Exercises" }
        ]
      },
      {
        id: "mat5ej306_m5",
        number: 5,
        title: "Open Ended (Computational LP)",
        topics: [
          { id: "mat5ej306_m5_u1", code: "OE1", unitNumber: 1, title: "Linear Programming Using SciPy & Python Solver Scripts" },
          { id: "mat5ej306_m5_u2", code: "OE2", unitNumber: 2, title: "Dual Simplex & IBM CPLEX Community Edition in Jupyter Notebooks" },
          { id: "mat5ej306_m5_u3", code: "OE3", unitNumber: 3, title: "Transportation Problem in Python & Linear Programming in Julia Language" }
        ]
      }
    ]
  },
  {
    id: "mat5ej307",
    code: "MAT5EJ307",
    title: "Foundations of Mathematics",
    subject: "mathematics",
    type: "elective",
    textbook: "Set Theory & Logic, Robert R. Stoll, Dover Publications (1979)",
    modules: [
      {
        id: "mat5ej307_m1",
        number: 1,
        title: "Naive Set Theory: Sets & Relations",
        topics: [
          { id: "mat5ej307_m1_u1", code: "Unit 1", unitNumber: 1, title: "§1,2: Cantor's Concept of a Set, The Basis of Intuitive Set Theory" },
          { id: "mat5ej307_m1_u2", code: "Unit 2", unitNumber: 2, title: "§3,4,5: Inclusion, Operations for Sets, The Algebra of Sets" },
          { id: "mat5ej307_m1_u3", code: "Unit 3", unitNumber: 3, title: "§6, §7, §8: Relations, Equivalence Relations, Functions" },
          { id: "mat5ej307_m1_u4", code: "Unit 4", unitNumber: 4, title: "§9: Composition & Inversion for Functions" },
          { id: "mat5ej307_m1_u5", code: "Unit 5", unitNumber: 5, title: "§10: Operations for Collections of Sets" },
          { id: "mat5ej307_m1_u6", code: "Unit 6", unitNumber: 6, title: "§11: Ordering Relations – POSETs, TOSETs, WOSETs" }
        ]
      },
      {
        id: "mat5ej307_m2",
        number: 2,
        title: "Cardinal & Ordinal Numbers",
        topics: [
          { id: "mat5ej307_m2_u7", code: "Unit 7", unitNumber: 7, title: "§1: The Natural Number Sequence" },
          { id: "mat5ej307_m2_u8", code: "Unit 8", unitNumber: 8, title: "§2: Proof & Definition by Induction" },
          { id: "mat5ej307_m2_u9", code: "Unit 9", unitNumber: 9, title: "§3: Cardinal Numbers" },
          { id: "mat5ej307_m2_u10", code: "Unit 10", unitNumber: 10, title: "§4: Countable Sets" },
          { id: "mat5ej307_m2_u11", code: "Unit 11", unitNumber: 11, title: "§5: Cardinal Arithmetic" },
          { id: "mat5ej307_m2_u12", code: "Unit 12", unitNumber: 12, title: "§6, §7: Order Types, Well Ordered Sets & Ordinal Numbers" },
          { id: "mat5ej307_m2_u13", code: "Unit 13", unitNumber: 13, title: "§8: Axiom of Choice, Well Ordering Theorem & Zorn's Lemma" },
          { id: "mat5ej307_m2_u14", code: "Unit 14", unitNumber: 14, title: "§9, §11: Further Properties of Cardinal Numbers, Paradoxes of Intuitive Set Theory" }
        ]
      },
      {
        id: "mat5ej307_m3",
        number: 3,
        title: "Mathematical Logic & Axiomatic Mathematics",
        topics: [
          { id: "mat5ej307_m3_u15", code: "Unit 15", unitNumber: 15, title: "§1-5: Statement Calculus – Connectives, Truth Tables, Validity, Consequence, Applications" },
          { id: "mat5ej307_m3_u16", code: "Unit 16", unitNumber: 16, title: "§6-9: Predicate Calculus – Formulation, Validity, Consequence, Applications" },
          { id: "mat5ej307_m3_u17", code: "Unit 17", unitNumber: 17, title: "Chapter 5: Informal Axiomatic Mathematics – A Quick Review of Chapter 5" }
        ]
      },
      {
        id: "mat5ej307_m4",
        number: 4,
        title: "Axiomatic Set Theory",
        topics: [
          { id: "mat5ej307_m4_u18", code: "Unit 18", unitNumber: 18, title: "§1, §2, §3: The Axioms of Extension & Set Formation, Pairing, Union & Power Set" },
          { id: "mat5ej307_m4_u19", code: "Unit 19", unitNumber: 19, title: "§4, §5, §6: Axiom of Infinity, Axiom of Choice, Replacement & Restriction" },
          { id: "mat5ej307_m4_u20", code: "Unit 20", unitNumber: 20, title: "§7: Ordinal Numbers" },
          { id: "mat5ej307_m4_u21", code: "Unit 21", unitNumber: 21, title: "§8: Ordinal Arithmetic" },
          { id: "mat5ej307_m4_u22", code: "Unit 22", unitNumber: 22, title: "§9: Cardinal Numbers & Their Arithmetic" }
        ]
      },
      {
        id: "mat5ej307_m5",
        number: 5,
        title: "Open Ended Module",
        topics: [
          { id: "mat5ej307_m5_u1", code: "OE1", unitNumber: 1, title: "Chap 2 Section 10: Theorems Equivalent to Axiom of Choice" },
          { id: "mat5ej307_m5_u2", code: "OE2", unitNumber: 2, title: "Chap 2: Proof of Theorem 8.1" },
          { id: "mat5ej307_m5_u3", code: "OE3", unitNumber: 3, title: "Chap 3: Extension of Natural Numbers to the Real Numbers" },
          { id: "mat5ej307_m5_u4", code: "OE4", unitNumber: 4, title: "Chap 7 Section 10: The von Neumann-Bernays-Gödel Theory of Sets" }
        ]
      }
    ]
  },
  {
    id: "mat5ej308",
    code: "MAT5EJ308",
    title: "Basics of Classical Mechanics",
    subject: "mathematics",
    type: "elective",
    textbook: "Classical Mechanics: The Theoretical Minimum, Leonard Susskind, Penguin Books (2014)",
    modules: [
      {
        id: "mat5ej308_m1",
        number: 1,
        title: "Newtonian Dynamics",
        topics: [
          { id: "mat5ej308_m1_u1", code: "Unit 1", unitNumber: 1, title: "Chapter 1: The Nature of Classical Physics" },
          { id: "mat5ej308_m1_u2", code: "Unit 2", unitNumber: 2, title: "Chapter 2: Motion" },
          { id: "mat5ej308_m1_u3", code: "Unit 3", unitNumber: 3, title: "Chapter 3: Dynamics: Aristotle's Law of Motion" },
          { id: "mat5ej308_m1_u4", code: "Unit 4", unitNumber: 4, title: "Chapter 3: Dynamics: Mass, Acceleration & Force" },
          { id: "mat5ej308_m1_u5", code: "Unit 5", unitNumber: 5, title: "Chapter 3: Dynamics: Some Simple Examples of Solving Newton's Equations" },
          { id: "mat5ej308_m1_u6", code: "Unit 6", unitNumber: 6, title: "Appendix 1: Central Forces & Planetary Orbits" }
        ]
      },
      {
        id: "mat5ej308_m2",
        number: 2,
        title: "Lagrangian Formulation",
        topics: [
          { id: "mat5ej308_m2_u7", code: "Unit 7", unitNumber: 7, title: "Chapter 4: SoMTOP: Systems of Particles, Space of States, Momentum & Phase Space" },
          { id: "mat5ej308_m2_u8", code: "Unit 8", unitNumber: 8, title: "Chapter 4: SoMTOP: Action, Reaction & Conservation of Momentum" },
          { id: "mat5ej308_m2_u9", code: "Unit 9", unitNumber: 9, title: "Chapter 5: Energy: Force & Potential Energy" },
          { id: "mat5ej308_m2_u10", code: "Unit 10", unitNumber: 10, title: "Chapter 5: Energy: More Than One Dimension" },
          { id: "mat5ej308_m2_u11", code: "Unit 11", unitNumber: 11, title: "Chapter 6: PoLA: Transition to Advanced Mechanics, Derivation of Euler-Lagrange Equation" },
          { id: "mat5ej308_m2_u12", code: "Unit 12", unitNumber: 12, title: "Chapter 6: PoLA: More Particles & More Dimensions, What's Good About Least Action?" },
          { id: "mat5ej308_m2_u13", code: "Unit 13", unitNumber: 13, title: "Chapter 6: PoLA: Generalised Coordinates & Moments, Cyclic Coordinates" }
        ]
      },
      {
        id: "mat5ej308_m3",
        number: 3,
        title: "Hamiltonian Formulation",
        topics: [
          { id: "mat5ej308_m3_u14", code: "Unit 14", unitNumber: 14, title: "Chapter 7: S&CL: Preliminaries, Examples of Symmetries, More General Symmetries" },
          { id: "mat5ej308_m3_u15", code: "Unit 15", unitNumber: 15, title: "Chapter 7: S&CL: Consequences of Symmetry, Back to Examples" },
          { id: "mat5ej308_m3_u16", code: "Unit 16", unitNumber: 16, title: "Chapter 8: Hamiltonian Mechanics & Time-Translation Invariance: Phase Space & Hamilton's Equations" },
          { id: "mat5ej308_m3_u17", code: "Unit 17", unitNumber: 17, title: "Chapter 8: HM&TTI: Harmonic Oscillator Hamiltonian, Derivation of Hamilton's Equations" },
          { id: "mat5ej308_m3_u18", code: "Unit 18", unitNumber: 18, title: "Chapter 9: Phase Space Fluid & Gibbs-Liouville Theorem: Phase Space Fluid" },
          { id: "mat5ej308_m3_u19", code: "Unit 19", unitNumber: 19, title: "Chapter 9: PSF&GLT: Flow & Divergence, Poisson Brackets" }
        ]
      },
      {
        id: "mat5ej308_m4",
        number: 4,
        title: "Poisson's Formulation & Electromagnetism",
        topics: [
          { id: "mat5ej308_m4_u20", code: "Unit 20", unitNumber: 20, title: "Chapter 10: PBAMS: Axiomatic Mechanics, Angular Momentum, Levi-Civita Symbol" },
          { id: "mat5ej308_m4_u21", code: "Unit 21", unitNumber: 21, title: "Chapter 10: PBAMS: Rotors & Precession, Symmetry & Conservation" },
          { id: "mat5ej308_m4_u22", code: "Unit 22", unitNumber: 22, title: "Chapter 11: Electric & Magnetic Forces" }
        ]
      },
      {
        id: "mat5ej308_m5",
        number: 5,
        title: "Open Ended Module",
        topics: [
          { id: "mat5ej308_m5_u1", code: "OE1", unitNumber: 1, title: "Quantum Mechanics: The Theoretical Minimum Concepts (Susskind & Friedman, 2014)" },
          { id: "mat5ej308_m5_u2", code: "OE2", unitNumber: 2, title: "Special Relativity & Classical Field Theory Concepts (Susskind & Friedman, 2017)" }
        ]
      }
    ]
  },
  {
    id: "mat5fs112",
    code: "MAT5FS112",
    title: "Mathematical Typesetting System - LaTeX",
    subject: "mathematics",
    type: "sec",
    textbook: "LaTeX Tutorial: A Primer, Indian TeX Users Group (2003) & More Math Into LaTeX (5th Ed), George Grätzer, Springer (2016)",
    modules: [
      {
        id: "mat5fs112_m1",
        number: 1,
        title: "Getting Started with LaTeX",
        topics: [
          { id: "mat5fs112_m1_u1", code: "Unit 1", unitNumber: 1, title: "The Basics – Tutorial I" },
          { id: "mat5fs112_m1_u2", code: "Unit 2", unitNumber: 2, title: "The Documents – Tutorial II" },
          { id: "mat5fs112_m1_u3", code: "Unit 3", unitNumber: 3, title: "Bibliographic Database – Tutorial III & IV" },
          { id: "mat5fs112_m1_u4", code: "Unit 4", unitNumber: 4, title: "Table of Contents and Index – Tutorial V (Omit glossary)" }
        ]
      },
      {
        id: "mat5fs112_m2",
        number: 2,
        title: "Styling Pages",
        topics: [
          { id: "mat5fs112_m2_u5", code: "Unit 5", unitNumber: 5, title: "Displayed Text – Tutorial VI" },
          { id: "mat5fs112_m2_u6", code: "Unit 6", unitNumber: 6, title: "Rows and Columns – Tutorial VII" },
          { id: "mat5fs112_m2_u7", code: "Unit 7", unitNumber: 7, title: "Tables – Tutorial VII.2" }
        ]
      },
      {
        id: "mat5fs112_m3",
        number: 3,
        title: "Typesetting Mathematics",
        topics: [
          { id: "mat5fs112_m3_u8", code: "Unit 8", unitNumber: 8, title: "Basic Mathematical Equations – Tutorial VIII.1, VIII.2" },
          { id: "mat5fs112_m3_u9", code: "Unit 9", unitNumber: 9, title: "Groups of Equations and Numbering – Tutorial VIII.3" },
          { id: "mat5fs112_m3_u10", code: "Unit 10", unitNumber: 10, title: "Matrices, Dots, Delimiters and Affixing Symbols – Tutorial VIII.4" },
          { id: "mat5fs112_m3_u11", code: "Unit 11", unitNumber: 11, title: "Operators, Equations, Symbols, Notations, Greek Letters – Tutorial VIII.5 to VIII.8" }
        ]
      },
      {
        id: "mat5fs112_m4",
        number: 4,
        title: "Theorems, Figures, Cross References & Presentations",
        topics: [
          { id: "mat5fs112_m4_u12", code: "Unit 12", unitNumber: 12, title: "Theorems in LaTeX – Tutorial IX.1" },
          { id: "mat5fs112_m4_u13", code: "Unit 13", unitNumber: 13, title: "The AMS Theorem Package – Tutorial IX.2 (Omit IX.2.2, IX.2.3)" },
          { id: "mat5fs112_m4_u14", code: "Unit 14", unitNumber: 14, title: "Boxes – Tutorial X (Section X.1, X.2 Only)" },
          { id: "mat5fs112_m4_u15", code: "Unit 15", unitNumber: 15, title: "Floating Images – Tutorial XI (Section XI.1.1, XI.1.2 and XI.1.5 Only)" },
          { id: "mat5fs112_m4_u16", code: "Unit 16", unitNumber: 16, title: "Cross References – Tutorial XII (Section XII.1, XII.2 Only)" },
          { id: "mat5fs112_m4_u17", code: "Unit 17", unitNumber: 17, title: "Footnotes – Tutorial XIII (Section XIII.1 Only)" },
          { id: "mat5fs112_m4_u18", code: "Unit 18", unitNumber: 18, title: "Beamer Presentation – Text 2, Section 12.1 to 12.2.4" },
          { id: "mat5fs112_m4_u19", code: "Unit 19", unitNumber: 19, title: "Beamer Presentation – Text 2, Section 12.2.6 to 12.2.9 (Omit 12.2.5, 12.2.7)" }
        ]
      },
      {
        id: "mat5fs112_m5",
        number: 5,
        title: "Open Ended Module",
        topics: [
          { id: "mat5fs112_m5_u1", code: "OE1", unitNumber: 1, title: "Installation of LaTeX & Familiarising Overleaf Platform" },
          { id: "mat5fs112_m5_u2", code: "OE2", unitNumber: 2, title: "Typesetting a Full Textbook Chapter with Math Symbols, Theorems & Figures" },
          { id: "mat5fs112_m5_u3", code: "OE3", unitNumber: 3, title: "Create Slides with Beamers and Scientific Posters" },
          { id: "mat5fs112_m5_u4", code: "OE4", unitNumber: 4, title: "Transliteration Symbols for Indian Languages (Sanskrit, Hindi Devanagari, Malayalam)" }
        ]
      }
    ]
  },
  {
    id: "mat6ej303",
    code: "MAT6EJ303(2)",
    title: "Machine Learning - I",
    subject: "mathematics",
    type: "elective",
    textbook: "Pattern Recognition and Machine Learning, Christopher M. Bishop, Springer (2006)",
    modules: [
      {
        id: "mat6ej303_m1",
        number: 1,
        title: "Introduction to Statistical Learning",
        topics: [
          { id: "mat6ej303_m1_u1", code: "Unit 1", unitNumber: 1, title: "Review of Probability Theory, Density and Distribution Functions" },
          { id: "mat6ej303_m1_u2", code: "Unit 2", unitNumber: 2, title: "Expectation and Covariance, Bayesian Probabilities" },
          { id: "mat6ej303_m1_u3", code: "Unit 3", unitNumber: 3, title: "Gaussian Distribution: Conditional and Marginal Distributions" },
          { id: "mat6ej303_m1_u4", code: "Unit 4", unitNumber: 4, title: "Maximum Likelihood and Bayesian Inference for Gaussian" },
          { id: "mat6ej303_m1_u5", code: "Unit 5", unitNumber: 5, title: "Decision Theory – Inference and Decision, Loss Functions" },
          { id: "mat6ej303_m1_u6", code: "Unit 6", unitNumber: 6, title: "Entropy, Relative Entropy and Mutual Information" }
        ]
      },
      {
        id: "mat6ej303_m2",
        number: 2,
        title: "Linear Regression",
        topics: [
          { id: "mat6ej303_m2_u7", code: "Unit 7", unitNumber: 7, title: "Maximum Likelihood and Least Squares" },
          { id: "mat6ej303_m2_u8", code: "Unit 8", unitNumber: 8, title: "Regularized Least Squares" },
          { id: "mat6ej303_m2_u9", code: "Unit 9", unitNumber: 9, title: "Bias-Variance Decomposition" },
          { id: "mat6ej303_m2_u10", code: "Unit 10", unitNumber: 10, title: "Bayesian Linear Regression" },
          { id: "mat6ej303_m2_u11", code: "Unit 11", unitNumber: 11, title: "Parameter and Predictive Distributions" },
          { id: "mat6ej303_m2_u12", code: "Unit 12", unitNumber: 12, title: "Bayesian Model Comparison" }
        ]
      },
      {
        id: "mat6ej303_m3",
        number: 3,
        title: "Linear Classification",
        topics: [
          { id: "mat6ej303_m3_u13", code: "Unit 13", unitNumber: 13, title: "Discriminant Functions" },
          { id: "mat6ej303_m3_u14", code: "Unit 14", unitNumber: 14, title: "Least Squares, Fisher's Discriminant and Relation Between Them" },
          { id: "mat6ej303_m3_u15", code: "Unit 15", unitNumber: 15, title: "The Perceptron Algorithm" },
          { id: "mat6ej303_m3_u16", code: "Unit 16", unitNumber: 16, title: "Maximum Likelihood Classifier" },
          { id: "mat6ej303_m3_u17", code: "Unit 17", unitNumber: 17, title: "Probabilistic Generative Models and Logistic Regression" },
          { id: "mat6ej303_m3_u18", code: "Unit 18", unitNumber: 18, title: "Bayesian Logistic Regression" }
        ]
      },
      {
        id: "mat6ej303_m4",
        number: 4,
        title: "Neural Networks",
        topics: [
          { id: "mat6ej303_m4_u19", code: "Unit 19", unitNumber: 19, title: "Feedforward Neural Networks" },
          { id: "mat6ej303_m4_u20", code: "Unit 20", unitNumber: 20, title: "Network Training and Gradient Descent Optimization" },
          { id: "mat6ej303_m4_u21", code: "Unit 21", unitNumber: 21, title: "Analysis of Error Backpropagation" },
          { id: "mat6ej303_m4_u22", code: "Unit 22", unitNumber: 22, title: "Hessian Matrix and Diagonal Approximation" },
          { id: "mat6ej303_m4_u23", code: "Unit 23", unitNumber: 23, title: "Regularization in Neural Networks" }
        ]
      },
      {
        id: "mat6ej303_m5",
        number: 5,
        title: "Open Ended Module",
        topics: [
          { id: "mat6ej303_m5_u1", code: "OE1", unitNumber: 1, title: "Model Selection and Validation" },
          { id: "mat6ej303_m5_u2", code: "OE2", unitNumber: 2, title: "Non-Uniform Learnability & The Run Time of Learning" }
        ]
      }
    ]
  },

  // =========================================================================
  // PHYSICS HONOURS
  // =========================================================================
  {
    id: "phy5cj301",
    code: "PHY5CJ301",
    title: "Quantum Mechanics I",
    subject: "physics",
    type: "core",
    textbook: "Introduction to Quantum Mechanics (3rd Ed), David J. Griffiths & Quantum Mechanics: Concepts and Applications (2nd Ed), Nouredine Zettili",
    modules: [
      {
        id: "phy5cj301_m1",
        number: 1,
        title: "The Wave Function",
        topics: [
          { id: "phy5cj301_m1_u1", code: "Unit 1", unitNumber: 1, title: "The Schrödinger Equation, The Statistical Interpretation" },
          { id: "phy5cj301_m1_u2", code: "Unit 2", unitNumber: 2, title: "Probability: Discrete Variables, Continuous Variables" },
          { id: "phy5cj301_m1_u3", code: "Unit 3", unitNumber: 3, title: "Normalization" },
          { id: "phy5cj301_m1_u4", code: "Unit 4", unitNumber: 4, title: "Momentum" },
          { id: "phy5cj301_m1_u5", code: "Unit 5", unitNumber: 5, title: "The Uncertainty Principle (Sections 1.1–1.6 Griffiths)" }
        ]
      },
      {
        id: "phy5cj301_m2",
        number: 2,
        title: "Time-Independent Schrödinger Equation",
        topics: [
          { id: "phy5cj301_m2_u6", code: "Unit 6", unitNumber: 6, title: "Stationary States – Time-Independent Schrödinger Eqn, Expectation Values, Probability Amplitudes" },
          { id: "phy5cj301_m2_u7", code: "Unit 7", unitNumber: 7, title: "The Infinite Square Well" },
          { id: "phy5cj301_m2_u8", code: "Unit 8", unitNumber: 8, title: "The Free Particle – Wave Packet, Phase and Group Velocities" },
          { id: "phy5cj301_m2_u9", code: "Unit 9", unitNumber: 9, title: "Conservation of Probability: Probability Density, Probability Current Density, Equation of Continuity" },
          { id: "phy5cj301_m2_u10", code: "Unit 10", unitNumber: 10, title: "The Potential Step: Case E > V0, Case E < V0" },
          { id: "phy5cj301_m2_u11", code: "Unit 11", unitNumber: 11, title: "The Potential Barrier: Case E > V0, Case E < V0 – Quantum Tunneling" }
        ]
      },
      {
        id: "phy5cj301_m3",
        number: 3,
        title: "Mathematical Tools of Quantum Mechanics",
        topics: [
          { id: "phy5cj301_m3_u12", code: "Unit 12", unitNumber: 12, title: "Hilbert Space and Wave Functions: Linear Vector Space, Basis, Square-Integrable Functions" },
          { id: "phy5cj301_m3_u13", code: "Unit 13", unitNumber: 13, title: "Dirac Notation: Kets, Bras, Bra-Kets and Their Properties" },
          { id: "phy5cj301_m3_u14", code: "Unit 14", unitNumber: 14, title: "Operators: General Definitions, Hermitian Adjoint and Its Properties, Hermitian Operators" },
          { id: "phy5cj301_m3_u15", code: "Unit 15", unitNumber: 15, title: "Commutator Algebra" },
          { id: "phy5cj301_m3_u16", code: "Unit 16", unitNumber: 16, title: "Uncertainty Relation Between Two Operators – General & Heisenberg Relations" },
          { id: "phy5cj301_m3_u17", code: "Unit 17", unitNumber: 17, title: "Functions of Operators" },
          { id: "phy5cj301_m3_u18", code: "Unit 18", unitNumber: 18, title: "Eigenvalues and Eigenvectors of an Operator (Theorems 2.1 – 2.5)" },
          { id: "phy5cj301_m3_u19", code: "Unit 19", unitNumber: 19, title: "Representation of Discrete Bases: Matrix Representation of Kets, Bras, Operators, Change of Bases" },
          { id: "phy5cj301_m3_u20", code: "Unit 20", unitNumber: 20, title: "Representation of Continuous Basis: Position & Momentum Representations and Connections" },
          { id: "phy5cj301_m3_u21", code: "Unit 21", unitNumber: 21, title: "Matrix and Wave Mechanics: Matrix Mechanics, Wave Mechanics" }
        ]
      },
      {
        id: "phy5cj301_m4",
        number: 4,
        title: "The Quantum Harmonic Oscillator",
        topics: [
          { id: "phy5cj301_m4_u22", code: "Unit 22", unitNumber: 22, title: "The Harmonic Oscillator: Energy Eigenvalues, Eigenstates in Position Space, Matrix Representation, Expectation Values" },
          { id: "phy5cj301_m4_u23", code: "Unit 23", unitNumber: 23, title: "3D Problems in Cartesian Coordinates – General Treatment & Separation of Variables" },
          { id: "phy5cj301_m4_u24", code: "Unit 24", unitNumber: 24, title: "The Box Potential – Rectangular and Cubic Box Potentials, Degeneracy" },
          { id: "phy5cj301_m4_u25", code: "Unit 25", unitNumber: 25, title: "The 3D Harmonic Oscillator: Anisotropic and Isotropic Oscillators, Degeneracy" }
        ]
      },
      {
        id: "phy5cj301_m5",
        number: 5,
        title: "Open Ended Module: Computer Simulations",
        topics: [
          { id: "phy5cj301_m5_u1", code: "OE1", unitNumber: 1, title: "Computer Simulations of Quantum Systems (Potential Well, Harmonic Oscillator Eigenvalue Solvers in Python)" }
        ]
      }
    ]
  },
  {
    id: "phy5cj302",
    code: "PHY5CJ302",
    title: "Optics",
    subject: "physics",
    type: "core",
    textbook: "Optics (6th Ed), Ajoy Ghatak & A Text Book of Optics, N. Subrahmanyam, Brij Lal and M.N Avadhanulu (2018)",
    modules: [
      {
        id: "phy5cj302_m1",
        number: 1,
        title: "Fermat's Principle",
        topics: [
          { id: "phy5cj302_m1_u1", code: "Unit 1", unitNumber: 1, title: "Laws of Reflection and Refraction from Fermat's Principle" },
          { id: "phy5cj302_m1_u2", code: "Unit 2", unitNumber: 2, title: "Refraction and Reflection at a Single Spherical Surface" },
          { id: "phy5cj302_m1_u3", code: "Unit 3", unitNumber: 3, title: "The Thin Lens, Principal Foci and Focal Length" },
          { id: "phy5cj302_m1_u4", code: "Unit 4", unitNumber: 4, title: "The Newton Formula, Lateral Magnification (Sections 3.1, 3.2, 4.1–4.7 Ghatak)" }
        ]
      },
      {
        id: "phy5cj302_m2",
        number: 2,
        title: "Interference",
        topics: [
          { id: "phy5cj302_m2_u5", code: "Unit 5", unitNumber: 5, title: "Superpositions of Two Sinusoidal Waves" },
          { id: "phy5cj302_m2_u6", code: "Unit 6", unitNumber: 6, title: "Interference Division of Wavefront Introduction" },
          { id: "phy5cj302_m2_u7", code: "Unit 7", unitNumber: 7, title: "Interference of Light Waves" },
          { id: "phy5cj302_m2_u8", code: "Unit 8", unitNumber: 8, title: "Fresnel's Two Mirror and Fresnel's Biprism" },
          { id: "phy5cj302_m2_u9", code: "Unit 9", unitNumber: 9, title: "Interference with White Light, Lloyd's Mirror, Phase Change on Reflection" },
          { id: "phy5cj302_m2_u10", code: "Unit 10", unitNumber: 10, title: "Interference by Division of Amplitude – Non-Reflecting Films" },
          { id: "phy5cj302_m2_u11", code: "Unit 11", unitNumber: 11, title: "Colours of Thin Films, Newton's Rings, Michelson Interferometer" }
        ]
      },
      {
        id: "phy5cj302_m3",
        number: 3,
        title: "Diffraction",
        topics: [
          { id: "phy5cj302_m3_u12", code: "Unit 12", unitNumber: 12, title: "Single-Slit Fraunhofer Diffraction Pattern" },
          { id: "phy5cj302_m3_u13", code: "Unit 13", unitNumber: 13, title: "Two-Slit Fraunhofer Diffraction Pattern" },
          { id: "phy5cj302_m3_u14", code: "Unit 14", unitNumber: 14, title: "N-Slit Fraunhofer Diffraction Pattern and Grating" },
          { id: "phy5cj302_m3_u15", code: "Unit 15", unitNumber: 15, title: "Fresnel Diffraction – Zone Plate" },
          { id: "phy5cj302_m3_u16", code: "Unit 16", unitNumber: 16, title: "Diffraction by Straight Edge (Sections 18.1, 18.2, 18.6–18.8, 20.1–20.3, 20.6)" }
        ]
      },
      {
        id: "phy5cj302_m4",
        number: 4,
        title: "Polarisation",
        topics: [
          { id: "phy5cj302_m4_u17", code: "Unit 17", unitNumber: 17, title: "Polarisation Introduction" },
          { id: "phy5cj302_m4_u18", code: "Unit 18", unitNumber: 18, title: "Production of Linearly Polarised Light" },
          { id: "phy5cj302_m4_u19", code: "Unit 19", unitNumber: 19, title: "Effects of Polariser and Analyser" },
          { id: "phy5cj302_m4_u20", code: "Unit 20", unitNumber: 20, title: "Double Refraction – Huygens' Explanation" },
          { id: "phy5cj302_m4_u21", code: "Unit 21", unitNumber: 21, title: "Wave Plates" },
          { id: "phy5cj302_m4_u22", code: "Unit 22", unitNumber: 22, title: "Production and Analysis of Different Polarised Light (Sections 20.1–20.4, 20.5, 20.6.2–20.6.3, 20.8.3, 20.9.1, 20.17–20.20 Book 2)" }
        ]
      },
      {
        id: "phy5cj302_m5",
        number: 5,
        title: "Practicals",
        topics: [
          { id: "phy5cj302_m5_u1", code: "P1", unitNumber: 1, title: "Liquid Lens: Refractive Index of Liquid and Material of Lens by Boy's Method" },
          { id: "phy5cj302_m5_u2", code: "P2", unitNumber: 2, title: "Focal Length of Combination of Two Lenses Separated by Distance d" },
          { id: "phy5cj302_m5_u3", code: "P3", unitNumber: 3, title: "Dispersive Power of Solid Prism using Spectrometer" },
          { id: "phy5cj302_m5_u4", code: "P4", unitNumber: 4, title: "Refractive Indices of Quartz Prism for Ordinary and Extraordinary Rays" },
          { id: "phy5cj302_m5_u5", code: "P5", unitNumber: 5, title: "Wavelengths of Mercury Spectrum using Diffraction Grating & Spectrometer" },
          { id: "phy5cj302_m5_u6", code: "P6", unitNumber: 6, title: "Newton's Rings: Determination of Wavelength of Sodium Light (Optional Tracker Analysis)" },
          { id: "phy5cj302_m5_u7", code: "P7", unitNumber: 7, title: "Air Wedge: Diameter / Radius of Thin Wire, Human Hair or Thin Foil" },
          { id: "phy5cj302_m5_u8", code: "P8", unitNumber: 8, title: "Single Slit Diffraction using Laser: Determination of Slit Width" },
          { id: "phy5cj302_m5_u9", code: "P9", unitNumber: 9, title: "Tracker Tool Analysis of Diffraction Patterns" },
          { id: "phy5cj302_m5_u10", code: "P10", unitNumber: 10, title: "Specific Rotation of Sugar Solution using Polarimeter" },
          { id: "phy5cj302_m5_u11", code: "P11", unitNumber: 11, title: "Verification of Malus's Law using Polarizer, Analyzer and Photodetector" },
          { id: "phy5cj302_m5_u12", code: "P12", unitNumber: 12, title: "Spectrometer: Determination of Cauchy's Dispersion Constants of Prism" }
        ]
      }
    ]
  },
  {
    id: "phy4cj203",
    code: "PHY4CJ203",
    title: "Electrodynamics II",
    subject: "physics",
    type: "core",
    textbook: "Introduction to Electrodynamics (5th Ed), David J. Griffiths & Electricity and Magnetism (10th Ed), R. Murugeshan",
    modules: [
      {
        id: "phy4cj203_m1",
        number: 1,
        title: "Electric and Magnetic Fields in Matter",
        topics: [
          { id: "phy4cj203_m1_u1", code: "Unit 1", unitNumber: 1, title: "Polarization" },
          { id: "phy4cj203_m1_u2", code: "Unit 2", unitNumber: 2, title: "The Field of a Polarised Object" },
          { id: "phy4cj203_m1_u3", code: "Unit 3", unitNumber: 3, title: "The Electric Displacement; Boundary Conditions; Susceptibility, Permittivity, Dielectric Constant of Linear Dielectrics" },
          { id: "phy4cj203_m1_u4", code: "Unit 4", unitNumber: 4, title: "Magnetisation" },
          { id: "phy4cj203_m1_u5", code: "Unit 5", unitNumber: 5, title: "The Field of a Magnetised Object, Bound Currents, Ampère's Law in Magnetized Materials, Susceptibility & Ferromagnetism" }
        ]
      },
      {
        id: "phy4cj203_m2",
        number: 2,
        title: "Electrodynamics & Maxwell's Equations",
        topics: [
          { id: "phy4cj203_m2_u6", code: "Unit 6", unitNumber: 6, title: "Ohm's Law; Electromotive Force; Motional EMF" },
          { id: "phy4cj203_m2_u7", code: "Unit 7", unitNumber: 7, title: "Electromagnetic Induction: Faraday's Law; Induced Electric Field; Inductance; Energy in Magnetic Fields" },
          { id: "phy4cj203_m2_u8", code: "Unit 8", unitNumber: 8, title: "Maxwell's Equations: Electrodynamics Before Maxwell; How Maxwell Fixed Ampère's Law; Maxwell's Eqns in Matter & Boundary Conditions" }
        ]
      },
      {
        id: "phy4cj203_m3",
        number: 3,
        title: "Electromagnetic Waves",
        topics: [
          { id: "phy4cj203_m3_u9", code: "Unit 9", unitNumber: 9, title: "Waves in One Dimension, Sinusoidal Waves, Polarization of Waves" },
          { id: "phy4cj203_m3_u10", code: "Unit 10", unitNumber: 10, title: "The Wave Equations for E and B" },
          { id: "phy4cj203_m3_u11", code: "Unit 11", unitNumber: 11, title: "Monochromatic Plane Waves" },
          { id: "phy4cj203_m3_u12", code: "Unit 12", unitNumber: 12, title: "Poynting's Theorem" },
          { id: "phy4cj203_m3_u13", code: "Unit 13", unitNumber: 13, title: "Energy and Momentum in Electromagnetic Waves" },
          { id: "phy4cj203_m3_u14", code: "Unit 14", unitNumber: 14, title: "Propagation of Waves in Linear Media" }
        ]
      },
      {
        id: "phy4cj203_m4",
        number: 4,
        title: "Transient Circuits and Alternating Currents",
        topics: [
          { id: "phy4cj203_m4_u15", code: "Unit 15", unitNumber: 15, title: "Growth of Current in Series L-R, C-R, and L-C Circuits" },
          { id: "phy4cj203_m4_u16", code: "Unit 16", unitNumber: 16, title: "Decay of Current in L-R, C-R and L-C Circuits" },
          { id: "phy4cj203_m4_u17", code: "Unit 17", unitNumber: 17, title: "Alternating Current: EMF in a Coil Rotating in a Magnetic Field" },
          { id: "phy4cj203_m4_u18", code: "Unit 18", unitNumber: 18, title: "AC Circuit Containing: R only, Inductance only, Capacitance only" },
          { id: "phy4cj203_m4_u19", code: "Unit 19", unitNumber: 19, title: "Use of j Operator in Study of A.C. Circuits" },
          { id: "phy4cj203_m4_u20", code: "Unit 20", unitNumber: 20, title: "AC Circuit Containing: L and R, C and R, Parallel L and C" },
          { id: "phy4cj203_m4_u21", code: "Unit 21", unitNumber: 21, title: "Series LCR Circuit & Power in AC" }
        ]
      },
      {
        id: "phy4cj203_m5",
        number: 5,
        title: "Practicals",
        topics: [
          { id: "phy4cj203_m5_u1", code: "P1", unitNumber: 1, title: "Verification of Faraday's Law and Lenz's Law of Induction (Galvanometer / ExpEYES)" },
          { id: "phy4cj203_m5_u2", code: "P2", unitNumber: 2, title: "Induced EMF in a Coil with Dropping Neodymium Magnet using ExpEYES" },
          { id: "phy4cj203_m5_u3", code: "P3", unitNumber: 3, title: "AC Three Phase Generator Demonstration" },
          { id: "phy4cj203_m5_u4", code: "P4", unitNumber: 4, title: "Demonstration of Eddy Currents (Viscous Drag / Falling Magnet in Tube)" },
          { id: "phy4cj203_m5_u5", code: "P5", unitNumber: 5, title: "Ballistic Constant of Galvanometer using Hibbert's Magnetic Standard (HMS)" },
          { id: "phy4cj203_m5_u6", code: "P6", unitNumber: 6, title: "BG: Determination of High Resistance by Leakage Method" },
          { id: "phy4cj203_m5_u7", code: "P7", unitNumber: 7, title: "Mutual Inductance and Coefficient of Coupling using Anderson's Bridge" },
          { id: "phy4cj203_m5_u8", code: "P8", unitNumber: 8, title: "Parallel Plate Capacitor: Area Relation & Dielectric Constant Determination" },
          { id: "phy4cj203_m5_u9", code: "P9", unitNumber: 9, title: "Brewster's Law Experiment: Angle of Polarisation & Refractive Index" },
          { id: "phy4cj203_m5_u10", code: "P10", unitNumber: 10, title: "RC and RL Transients: Determination of Capacitance, Inductance & Time Constant" },
          { id: "phy4cj203_m5_u11", code: "P11", unitNumber: 11, title: "RL and RC Series AC Circuits: Phase Relationships of Voltage" },
          { id: "phy4cj203_m5_u12", code: "P12", unitNumber: 12, title: "Series LCR Circuits: Resonant Frequency, Bandwidth & Quality Factor" },
          { id: "phy4cj203_m5_u13", code: "P13", unitNumber: 13, title: "Python Simulation of RC and RL Circuits under AC and DC" }
        ]
      }
    ]
  },
  {
    id: "phy5ej301",
    code: "PHY5EJ301",
    title: "Materials Science",
    subject: "physics",
    type: "elective",
    textbook: "Materials Science and Engineering An Introduction (7th Ed), William D. Callister & Materials Engineering, Science, Processing and Design, Michael Ashby",
    modules: [
      {
        id: "phy5ej301_m1",
        number: 1,
        title: "Materials, Interatomic Forces, and Bonding",
        topics: [
          { id: "phy5ej301_m1_u1", code: "Unit 1", unitNumber: 1, title: "What is Material Science and Need of Material Science (Elementary Ideas)" },
          { id: "phy5ej301_m1_u2", code: "Unit 2", unitNumber: 2, title: "Classification of Materials – Metals, Ceramics, Polymers, Composites, Advanced Materials" },
          { id: "phy5ej301_m1_u3", code: "Unit 3", unitNumber: 3, title: "Bonding Forces and Energies, Primary Interatomic Bonds" },
          { id: "phy5ej301_m1_u4", code: "Unit 4", unitNumber: 4, title: "Ionic Bonding, Covalent Bonding, Metallic Bonding, van der Waals Bonding" },
          { id: "phy5ej301_m1_u5", code: "Unit 5", unitNumber: 5, title: "Examples of Anomalous Volume Expansion of Water" }
        ]
      },
      {
        id: "phy5ej301_m2",
        number: 2,
        title: "Crystal Structure and Imperfections in Solids",
        topics: [
          { id: "phy5ej301_m2_u6", code: "Unit 6", unitNumber: 6, title: "Single Crystals, Polycrystalline Materials, Anisotropy, Nanocrystalline Solids" },
          { id: "phy5ej301_m2_u7", code: "Unit 7", unitNumber: 7, title: "Imperfections, Vacancies and Self Interstitials" },
          { id: "phy5ej301_m2_u8", code: "Unit 8", unitNumber: 8, title: "Impurities in Solids, Specification of Composition, Linear, Interfacial & Volume Defects" },
          { id: "phy5ej301_m2_u9", code: "Unit 9", unitNumber: 9, title: "Atomic Vibrations, Microstructure, Grain Size Determination" }
        ]
      },
      {
        id: "phy5ej301_m3",
        number: 3,
        title: "Types of Materials",
        topics: [
          { id: "phy5ej301_m3_u10", code: "Unit 10", unitNumber: 10, title: "Conductors, Insulators, and Dielectrics: Thermal Conductivity and Electrical Resistivity" },
          { id: "phy5ej301_m3_u11", code: "Unit 11", unitNumber: 11, title: "Origins and Manipulation of Electrical Properties" },
          { id: "phy5ej301_m3_u12", code: "Unit 12", unitNumber: 12, title: "Magnetic Materials: Physics and Manipulation of Magnetic Properties" },
          { id: "phy5ej301_m3_u13", code: "Unit 13", unitNumber: 13, title: "Materials Selection for Magnetic Design" },
          { id: "phy5ej301_m3_u14", code: "Unit 14", unitNumber: 14, title: "Materials for Optical Devices: Interaction of Materials and Radiation, Optical Properties" },
          { id: "phy5ej301_m3_u15", code: "Unit 15", unitNumber: 15, title: "Durability of Materials: Oxidation, Corrosion, and Degradation" }
        ]
      },
      {
        id: "phy5ej301_m4",
        number: 4,
        title: "Characterization Studies and Techniques",
        topics: [
          { id: "phy5ej301_m4_u16", code: "Unit 16", unitNumber: 16, title: "Electrical and Electronic Measurements" },
          { id: "phy5ej301_m4_u17", code: "Unit 17", unitNumber: 17, title: "Hall Effect in Semiconductors Introduction" },
          { id: "phy5ej301_m4_u18", code: "Unit 18", unitNumber: 18, title: "Magnetism and Magnetic Measurement" },
          { id: "phy5ej301_m4_u19", code: "Unit 19", unitNumber: 19, title: "Introduction to Electrochemical Techniques" },
          { id: "phy5ej301_m4_u20", code: "Unit 20", unitNumber: 20, title: "Cyclic Voltammetry" },
          { id: "phy5ej301_m4_u21", code: "Unit 21", unitNumber: 21, title: "Optical Microscopy, Photoluminescence Spectroscopy" },
          { id: "phy5ej301_m4_u22", code: "Unit 22", unitNumber: 22, title: "Raman Spectroscopy of Solids" }
        ]
      },
      {
        id: "phy5ej301_m5",
        number: 5,
        title: "Open Ended Module",
        topics: [
          { id: "phy5ej301_m5_u1", code: "OE1", unitNumber: 1, title: "Synthesis of Gold / Silver Nanoparticles & Soft Lithography Using PDMS" },
          { id: "phy5ej301_m5_u2", code: "OE2", unitNumber: 2, title: "Thin Film Deposition by Spin Coating / Dip Coating / Spray Pyrolysis" },
          { id: "phy5ej301_m5_u3", code: "OE3", unitNumber: 3, title: "Solid State Reaction of Powder Ceramics" }
        ]
      }
    ]
  },
  {
    id: "phy5ej302",
    code: "PHY5EJ302",
    title: "Properties of Solids",
    subject: "physics",
    type: "elective",
    textbook: "Solid State Physics, R.K. Puri & V.K. Babbar & Solid State Physics (6th Ed), S.O. Pillai",
    modules: [
      {
        id: "phy5ej302_m1",
        number: 1,
        title: "Crystal Structure",
        topics: [
          { id: "phy5ej302_m1_u1", code: "Unit 1", unitNumber: 1, title: "Crystal Lattice and Translation Vectors, Unit Cell, Basis" },
          { id: "phy5ej302_m1_u2", code: "Unit 2", unitNumber: 2, title: "Symmetry Operations, Point Groups and Space Groups" },
          { id: "phy5ej302_m1_u3", code: "Unit 3", unitNumber: 3, title: "Types of Lattices, Lattice Directions and Planes, Interplanar Spacing" },
          { id: "phy5ej302_m1_u4", code: "Unit 4", unitNumber: 4, title: "Simple Crystal Structures with Examples" },
          { id: "phy5ej302_m1_u5", code: "Unit 5", unitNumber: 5, title: "X-Ray Diffraction and Reciprocal Lattice. Brillouin Zones" }
        ]
      },
      {
        id: "phy5ej302_m2",
        number: 2,
        title: "Theory of Solids",
        topics: [
          { id: "phy5ej302_m2_u6", code: "Unit 6", unitNumber: 6, title: "Drude – Lorentz's Classical Theory" },
          { id: "phy5ej302_m2_u7", code: "Unit 7", unitNumber: 7, title: "Sommerfeld's Quantum Theory – Free Electron Gas in One Dimension" },
          { id: "phy5ej302_m2_u8", code: "Unit 8", unitNumber: 8, title: "Fermi Energy, Total Energy, Density of States, Filling of Energy Levels" },
          { id: "phy5ej302_m2_u9", code: "Unit 9", unitNumber: 9, title: "Application of Free Electron Gas Model" },
          { id: "phy5ej302_m2_u10", code: "Unit 10", unitNumber: 10, title: "Band Theory of Solids – Bloch Theorem, Kronig-Penney Model, Velocity and Effective Mass of Electron" },
          { id: "phy5ej302_m2_u11", code: "Unit 11", unitNumber: 11, title: "Distinction Between Metal, Insulator and Semiconductors" }
        ]
      },
      {
        id: "phy5ej302_m3",
        number: 3,
        title: "Semiconductor Properties",
        topics: [
          { id: "phy5ej302_m3_u12", code: "Unit 12", unitNumber: 12, title: "Semiconductors – Intrinsic and Extrinsic" },
          { id: "phy5ej302_m3_u13", code: "Unit 13", unitNumber: 13, title: "Drift Velocity" },
          { id: "phy5ej302_m3_u14", code: "Unit 14", unitNumber: 14, title: "Mobility and Conductivity of Intrinsic Semiconductors" },
          { id: "phy5ej302_m3_u15", code: "Unit 15", unitNumber: 15, title: "Carrier Concentration, Fermi Level" },
          { id: "phy5ej302_m3_u16", code: "Unit 16", unitNumber: 16, title: "Conductivity for Intrinsic and Extrinsic Semiconductors" }
        ]
      },
      {
        id: "phy5ej302_m4",
        number: 4,
        title: "Dielectric and Magnetic Properties of Solids",
        topics: [
          { id: "phy5ej302_m4_u17", code: "Unit 17", unitNumber: 17, title: "Types of Magnetism – Origin of Permanent Magnetic Moment" },
          { id: "phy5ej302_m4_u18", code: "Unit 18", unitNumber: 18, title: "Diamagnetism and Paramagnetism (Classical Theory), Ferromagnetism (Weiss Theory)" },
          { id: "phy5ej302_m4_u19", code: "Unit 19", unitNumber: 19, title: "Antiferromagnetism and Ferrimagnetism (Qualitative Ideas Only)" },
          { id: "phy5ej302_m4_u20", code: "Unit 20", unitNumber: 20, title: "Polarisation, Susceptibility, Local Field" },
          { id: "phy5ej302_m4_u21", code: "Unit 21", unitNumber: 21, title: "Dielectric Constant and Polarizability and Its Sources" },
          { id: "phy5ej302_m4_u22", code: "Unit 22", unitNumber: 22, title: "Ferro and Piezo Electricity (Qualitative Ideas Only)" }
        ]
      },
      {
        id: "phy5ej302_m5",
        number: 5,
        title: "Open Ended Module",
        topics: [
          { id: "phy5ej302_m5_u1", code: "OE1", unitNumber: 1, title: "Crystal Bonding and Defects in Crystals" }
        ]
      }
    ]
  },
  {
    id: "phy5ej303",
    code: "PHY5EJ303",
    title: "Photonics",
    subject: "physics",
    type: "elective",
    textbook: "Optics (5th Ed), Ajoy Ghatak & Laser and Nonlinear Optics, B.B. Laud",
    modules: [
      {
        id: "phy5ej303_m1",
        number: 1,
        title: "Lasers: An Introduction",
        topics: [
          { id: "phy5ej303_m1_u1", code: "Unit 1", unitNumber: 1, title: "Introduction, Spontaneous and Stimulated Emission, Main Components of Laser" },
          { id: "phy5ej303_m1_u2", code: "Unit 2", unitNumber: 2, title: "Understanding Optical Amplification: The EDFA" },
          { id: "phy5ej303_m1_u3", code: "Unit 3", unitNumber: 3, title: "The Resonator, The Lasing Action, Optical Resonators" },
          { id: "phy5ej303_m1_u4", code: "Unit 4", unitNumber: 4, title: "Einstein's Equation and Conditions for Light Amplification, Metastable State, Population Inversion" },
          { id: "phy5ej303_m1_u5", code: "Unit 5", unitNumber: 5, title: "Cavity Lifetime, The Threshold Condition" },
          { id: "phy5ej303_m1_u6", code: "Unit 6", unitNumber: 6, title: "Lineshape Function, Monochromaticity of Laser Beam" },
          { id: "phy5ej303_m1_u7", code: "Unit 7", unitNumber: 7, title: "Laser Pumping – Two Level System, Three Level System" }
        ]
      },
      {
        id: "phy5ej303_m2",
        number: 2,
        title: "Laser Systems and Applications",
        topics: [
          { id: "phy5ej303_m2_u8", code: "Unit 8", unitNumber: 8, title: "Solid State Lasers – Ruby Laser, Nd:YAG Laser" },
          { id: "phy5ej303_m2_u9", code: "Unit 9", unitNumber: 9, title: "Liquid Lasers – Dye Lasers" },
          { id: "phy5ej303_m2_u10", code: "Unit 10", unitNumber: 10, title: "Gas Lasers – Helium-Neon Laser, CO2 Laser" },
          { id: "phy5ej303_m2_u11", code: "Unit 11", unitNumber: 11, title: "Semiconductor Laser – Double Heterojunction Laser" },
          { id: "phy5ej303_m2_u12", code: "Unit 12", unitNumber: 12, title: "Chemical Laser – HCl Laser, HF Laser, Free Electron Laser" }
        ]
      },
      {
        id: "phy5ej303_m3",
        number: 3,
        title: "Nonlinear Optics",
        topics: [
          { id: "phy5ej303_m3_u13", code: "Unit 13", unitNumber: 13, title: "Harmonic Generation, Second Harmonic Generation, Phase Matching" },
          { id: "phy5ej303_m3_u14", code: "Unit 14", unitNumber: 14, title: "Third Harmonic Generation, Optical Mixing, Parametric Generation of Light" },
          { id: "phy5ej303_m3_u15", code: "Unit 15", unitNumber: 15, title: "Frequency Upconversion, Self-Focusing of Light" },
          { id: "phy5ej303_m3_u16", code: "Unit 16", unitNumber: 16, title: "Multiphoton Processes – Two Photon and Three Photon Processes" }
        ]
      },
      {
        id: "phy5ej303_m4",
        number: 4,
        title: "Optical Fiber Basics",
        topics: [
          { id: "phy5ej303_m4_u17", code: "Unit 17", unitNumber: 17, title: "Introduction, Historical Remarks" },
          { id: "phy5ej303_m4_u18", code: "Unit 18", unitNumber: 18, title: "Total Internal Reflection, The Numerical Aperture" },
          { id: "phy5ej303_m4_u19", code: "Unit 19", unitNumber: 19, title: "Attenuation in Optical Fibers" },
          { id: "phy5ej303_m4_u20", code: "Unit 20", unitNumber: 20, title: "Multimode Fibers, Pulse Dispersion in Multimode Optical Fibers, Maximum Bit Rates" },
          { id: "phy5ej303_m4_u21", code: "Unit 21", unitNumber: 21, title: "Fiber Optic Sensors" },
          { id: "phy5ej303_m4_u22", code: "Unit 22", unitNumber: 22, title: "TE & TM Modes of a Symmetric Step Index Planar Waveguide (Qualitative Idea)" }
        ]
      },
      {
        id: "phy5ej303_m5",
        number: 5,
        title: "Open Ended Module: Hands-On Training",
        topics: [
          { id: "phy5ej303_m5_u1", code: "OE1", unitNumber: 1, title: "Refraction of Laser Beam in Glass Slab & Refractive Index via TIR" },
          { id: "phy5ej303_m5_u2", code: "OE2", unitNumber: 2, title: "Numerical Aperture and Acceptance Angle of Optical Fibre" },
          { id: "phy5ej303_m5_u3", code: "OE3", unitNumber: 3, title: "Divergence & Spot Size Measurement of Diode Laser Beam" }
        ]
      }
    ]
  },
  {
    id: "phy5ej304",
    code: "PHY4CJ205",
    title: "Introductory Molecular Spectroscopy",
    subject: "physics",
    type: "elective",
    textbook: "Fundamentals of Molecular Spectroscopy, C.N. Banwell & Molecular Structure & Spectroscopy, G. Aruldhas",
    modules: [
      {
        id: "phy5ej304_m1",
        number: 1,
        title: "Introduction to Spectroscopy",
        topics: [
          { id: "phy5ej304_m1_u1", code: "Unit 1", unitNumber: 1, title: "Quantization of Energy, Regions of Spectrum" },
          { id: "phy5ej304_m1_u2", code: "Unit 2", unitNumber: 2, title: "Representation of Spectra, Basic Elements to Practical Spectroscopy" },
          { id: "phy5ej304_m1_u3", code: "Unit 3", unitNumber: 3, title: "Signal-to-Noise Ratio" },
          { id: "phy5ej304_m1_u4", code: "Unit 4", unitNumber: 4, title: "Width and Intensity of Spectral Lines" }
        ]
      },
      {
        id: "phy5ej304_m2",
        number: 2,
        title: "Microwave Spectroscopy",
        topics: [
          { id: "phy5ej304_m2_u5", code: "Unit 5", unitNumber: 5, title: "Rotation of Molecules, Rotational Spectra" },
          { id: "phy5ej304_m2_u6", code: "Unit 6", unitNumber: 6, title: "Rigid Diatomic Molecules, Intensities of Spectral Lines" },
          { id: "phy5ej304_m2_u7", code: "Unit 7", unitNumber: 7, title: "Effect of Isotopic Substitution, Non-Rigid Rotator" },
          { id: "phy5ej304_m2_u8", code: "Unit 8", unitNumber: 8, title: "The Spectrum of Non-Rigid Rotator" },
          { id: "phy5ej304_m2_u9", code: "Unit 9", unitNumber: 9, title: "Polyatomic Molecules – Linear, Symmetric and Asymmetric Top Molecules, Stark Effect" }
        ]
      },
      {
        id: "phy5ej304_m3",
        number: 3,
        title: "Infra-red Spectroscopy",
        topics: [
          { id: "phy5ej304_m3_u10", code: "Unit 10", unitNumber: 10, title: "Vibrating Diatomic Molecule – Energy of a Diatomic Molecule" },
          { id: "phy5ej304_m3_u11", code: "Unit 11", unitNumber: 11, title: "Simple Harmonic Oscillator, Anharmonic Oscillator" },
          { id: "phy5ej304_m3_u12", code: "Unit 12", unitNumber: 12, title: "Diatomic Vibrating Rotator" },
          { id: "phy5ej304_m3_u13", code: "Unit 13", unitNumber: 13, title: "Vibration-Rotation Spectrum of CO, Born–Oppenheimer Approximation" },
          { id: "phy5ej304_m3_u14", code: "Unit 14", unitNumber: 14, title: "Effect of Breakdown of Born Oppenheimer Approximation" },
          { id: "phy5ej304_m3_u15", code: "Unit 15", unitNumber: 15, title: "Vibration of Polyatomic Molecules" },
          { id: "phy5ej304_m3_u16", code: "Unit 16", unitNumber: 16, title: "Influence of Rotation on Spectra of Polyatomic Molecules, IR Techniques" }
        ]
      },
      {
        id: "phy5ej304_m4",
        number: 4,
        title: "Raman Spectroscopy",
        topics: [
          { id: "phy5ej304_m4_u17", code: "Unit 17", unitNumber: 17, title: "Quantum and Classical Approach Towards Raman Effect" },
          { id: "phy5ej304_m4_u18", code: "Unit 18", unitNumber: 18, title: "Pure Rotational Raman Spectra of Linear, Symmetric Top and Spherical Top Molecules" },
          { id: "phy5ej304_m4_u19", code: "Unit 19", unitNumber: 19, title: "Vibrational Raman Spectra, Rule of Mutual Exclusion" },
          { id: "phy5ej304_m4_u20", code: "Unit 20", unitNumber: 20, title: "Overtone and Combination Vibrations, Rotational Fine Structure" },
          { id: "phy5ej304_m4_u21", code: "Unit 21", title: "Polarization of Light and Raman Effect" },
          { id: "phy5ej304_m4_u22", code: "Unit 22", title: "Raman & IR Spectroscopy in Structure Determination, Instrumentation" }
        ]
      },
      {
        id: "phy5ej304_m5",
        number: 5,
        title: "Open Ended Module: Electronic Spectroscopy",
        topics: [
          { id: "phy5ej304_m5_u1", code: "OE1", unitNumber: 1, title: "Electronic Spectra of Diatomic Molecules & Franck-Condon Principle" },
          { id: "phy5ej304_m5_u2", code: "OE2", unitNumber: 2, title: "Dissociation Energy, Fortrat Diagram & Pre-Dissociation" }
        ]
      }
    ]
  },
  {
    id: "phy5ej305",
    code: "PHY5EJ305",
    title: "Introductory Medical Physics",
    subject: "physics",
    type: "elective",
    textbook: "Biomedical Instrumentation and Measurement, Leslie Cromwell & Biomedical Instrumentation, R.S. Khandpur",
    modules: [
      {
        id: "phy5ej305_m1",
        number: 1,
        title: "Biometrics – Man as a Physical Instrument",
        topics: [
          { id: "phy5ej305_m1_u1", code: "Unit 1", unitNumber: 1, title: "Biomedical Instrumentation: Range, Sensitivity, Linearity, Hysteresis, SNR, Stability" },
          { id: "phy5ej305_m1_u2", code: "Unit 2", unitNumber: 2, title: "Aspects of Man-Instrument System: Information Gathering, Diagnosis, Monitoring, Control" },
          { id: "phy5ej305_m1_u3", code: "Unit 3", unitNumber: 3, title: "Components of Man-Instrument System: Subject, Stimulus, Transducer, Display, Recorder" },
          { id: "phy5ej305_m1_u4", code: "Unit 4", unitNumber: 4, title: "Physiological Systems: Biochemical, Cardiovascular, Respiratory, Nervous Systems" }
        ]
      },
      {
        id: "phy5ej305_m2",
        number: 2,
        title: "Bioelectric Potentials and Major Physiological Systems",
        topics: [
          { id: "phy5ej305_m2_u5", code: "Unit 5", unitNumber: 5, title: "Sources of Bioelectric Potentials: Resting and Action Potentials, Propagation" },
          { id: "phy5ej305_m2_u6", code: "Unit 6", unitNumber: 6, title: "Bio-Electric Potentials: ECG, EEG, EMG" },
          { id: "phy5ej305_m2_u7", code: "Unit 7", unitNumber: 7, title: "The Heart and Cardiovascular System: Heart, Blood Pressure, Characteristics of Blood Flow" },
          { id: "phy5ej305_m2_u8", code: "Unit 8", unitNumber: 8, title: "Electrocardiography – Electrodes and Leads, Principles of Recording, BP Measurement" },
          { id: "phy5ej305_m2_u9", code: "Unit 9", unitNumber: 9, title: "Measurements in Respiratory System: Physiology & Spirometer Mechanics" },
          { id: "phy5ej305_m2_u10", code: "Unit 10", unitNumber: 10, title: "Nervous System: Anatomy, Neuronal Communication, Neuronal Firing Measurements" },
          { id: "phy5ej305_m2_u11", code: "Unit 11", unitNumber: 11, title: "Principles of EEG and EMG" }
        ]
      },
      {
        id: "phy5ej305_m3",
        number: 3,
        title: "Principles of Medical Imaging - 1",
        topics: [
          { id: "phy5ej305_m3_u12", code: "Unit 14", unitNumber: 14, title: "Ultrasonic Imaging: Properties of Ultrasound" },
          { id: "phy5ej305_m3_u13", code: "Unit 15", unitNumber: 15, title: "Modes of Ultrasound Transmission: Pulsed, Continuous, Doppler, Transducers" },
          { id: "phy5ej305_m3_u14", code: "Unit 16", unitNumber: 16, title: "Generation of Ionizing Radiation" },
          { id: "phy5ej305_m3_u15", code: "Unit 17", unitNumber: 17, title: "Instrumentation for Diagnostic X-Rays & Special Techniques" }
        ]
      },
      {
        id: "phy5ej305_m4",
        number: 4,
        title: "Principles of Medical Imaging - 2",
        topics: [
          { id: "phy5ej305_m4_u16", code: "Unit 19", unitNumber: 19, title: "Radio-isotopes in Medical Diagnosis, Physics of Radioactivity" },
          { id: "phy5ej305_m4_u17", code: "Unit 20", unitNumber: 20, title: "The Gamma Camera, Emission Computed Tomography (ECT), PET Scanner" },
          { id: "phy5ej305_m4_u18", code: "Unit 21", unitNumber: 21, title: "Principles of NMR Imaging Systems, Image Reconstruction, NMR Components" },
          { id: "phy5ej305_m4_u19", code: "Unit 22", unitNumber: 22, title: "Biological Effects of NMR Imaging, Advantages of NMR Imaging System" }
        ]
      },
      {
        id: "phy5ej305_m5",
        number: 5,
        title: "Open Ended Module",
        topics: [
          { id: "phy5ej305_m5_u1", code: "OE1", unitNumber: 1, title: "Biological Effects of Radiation, SPECT & Nuclear Medicine Manifestations" },
          { id: "phy5ej305_m5_u2", code: "OE2", unitNumber: 2, title: "Lasers in Medicine: Tissue Effects, Surgical & Ophthalmic Uses, Laser Hazards" }
        ]
      }
    ]
  },
  {
    id: "phy5ej306",
    code: "PHY5EJ306",
    title: "Physics of the Human Body",
    subject: "physics",
    type: "elective",
    textbook: "Physics of the Human Body (2nd Ed), Irving P. Herman, Springer (2016)",
    modules: [
      {
        id: "phy5ej306_m1",
        number: 1,
        title: "Static Equilibrium of the Body",
        topics: [
          { id: "phy5ej306_m1_u1", code: "Unit 1", unitNumber: 1, title: "Review of Forces, Torques, and Equilibrium (Section 2.1)" },
          { id: "phy5ej306_m1_u2", code: "Unit 2", unitNumber: 2, title: "Statics: Motion in One Plane and Levers (Section 2.2)" },
          { id: "phy5ej306_m1_u3", code: "Unit 3", unitNumber: 3, title: "Statics in the Body: Lower Arm and Hip Examples (Sections 2.3, 2.3.1, 2.3.2)" },
          { id: "phy5ej306_m1_u4", code: "Unit 4", unitNumber: 4, title: "Total Body Equilibrium & Equilibrium of Individual Body Components (Section 2.3.2)" },
          { id: "phy5ej306_m1_u5", code: "Unit 5", unitNumber: 6, title: "Standing: Overall & Local Stability, Forces on the Feet (Section 3.2)" }
        ]
      },
      {
        id: "phy5ej306_m2",
        number: 2,
        title: "Physical Aspects of Walking",
        topics: [
          { id: "phy5ej306_m2_u6", code: "Unit 8", unitNumber: 8, title: "Kinematics of Walking, Friction (Sections 3.3, 3.3.1, 3.3.3)" },
          { id: "phy5ej306_m2_u7", code: "Unit 9", unitNumber: 9, title: "Energetics. Collisions of the Human Body: Kinematics of Collisions, Partially Elastic Collisions (3.3.4, 3.10, 3.10.1)" },
          { id: "phy5ej306_m2_u8", code: "Unit 10", unitNumber: 10, title: "Consequences of Collisions & Calculation of GSI (Section 3.10.2)" }
        ]
      },
      {
        id: "phy5ej306_m3",
        number: 3,
        title: "Material Components of the Body",
        topics: [
          { id: "phy5ej306_m3_u9", code: "Unit 11", unitNumber: 11, title: "Introduction to Bone (Section 4.1, 4.1.1)" },
          { id: "phy5ej306_m3_u10", code: "Unit 12", unitNumber: 12, title: "Ligaments and Tendons, Cartilage (Section 4.1.2, 4.1.3)" },
          { id: "phy5ej306_m3_u11", code: "Unit 13", unitNumber: 13, title: "Elastic Properties: Basic Stress-Strain Relationships (Section 4.2.1)" },
          { id: "phy5ej306_m3_u12", code: "Unit 14", unitNumber: 14, title: "Other Stress-Strain Relations, Bone Shortening (Section 4.2.2, 4.2.3)" },
          { id: "phy5ej306_m3_u13", code: "Unit 15", unitNumber: 15, title: "Energy Storage in Elastic Media, Tendons and Long Bones (Section 4.2.4)" },
          { id: "phy5ej306_m3_u14", code: "Unit 17", unitNumber: 17, title: "Bone Fractures: Modes of Sudden Breaking of Bones (Section 4.7, 4.7.1)" }
        ]
      },
      {
        id: "phy5ej306_m4",
        number: 4,
        title: "Physical Aspects of Muscles",
        topics: [
          { id: "phy5ej306_m4_u15", code: "Unit 18", unitNumber: 18, title: "Muscles, Skeletal Muscles in the Body (Section 5, 5.1)" },
          { id: "phy5ej306_m4_u16", code: "Unit 19", unitNumber: 19, title: "Types of Muscle Activity – Structure of Muscles & Banded Myofilament (5.1.1, 5.2)" },
          { id: "phy5ej306_m4_u17", code: "Unit 20", unitNumber: 20, title: "Activating Muscles: Macroscopic View (Section 5.3)" },
          { id: "phy5ej306_m4_u18", code: "Unit 21", unitNumber: 21, title: "Muscle Strength and Evolution: Increasing Strength with Training" },
          { id: "phy5ej306_m4_u19", code: "Unit 22", unitNumber: 22, title: "Muscle Evolution with Age, Muscle Fatigue (Section 5.11)" }
        ]
      },
      {
        id: "phy5ej306_m5",
        number: 5,
        title: "Open Ended Module",
        topics: [
          { id: "phy5ej306_m5_u1", code: "OE1", unitNumber: 1, title: "Advanced Features of Walking, Running, Jumping, Avoiding Fractures & Helmet Materials" }
        ]
      }
    ]
  },
  {
    id: "phy5ej307",
    code: "PHY5EJ307",
    title: "Foundations of Data Science",
    subject: "physics",
    type: "elective",
    textbook: "Introduction to Linear Algebra, Gilbert Strang & Fundamentals of Mathematical Statistics, S.C. Gupta & V.K. Kapoor",
    modules: [
      {
        id: "phy5ej307_m1",
        number: 1,
        title: "Linear Algebra",
        topics: [
          { id: "phy5ej307_m1_u1", code: "Unit 1", unitNumber: 1, title: "Matrices: Properties of Matrix, Various Kinds of Matrices" },
          { id: "phy5ej307_m1_u2", code: "Unit 2", unitNumber: 2, title: "Elementary Transformations of Matrices and Rank of Matrices" },
          { id: "phy5ej307_m1_u3", code: "Unit 3", unitNumber: 3, title: "Determinants, Minors, Cofactors, Inverse of a Matrix" },
          { id: "phy5ej307_m1_u4", code: "Unit 4", unitNumber: 4, title: "Linear Independence: Characteristic Equations, Eigenvalues and Eigenvectors" },
          { id: "phy5ej307_m1_u5", code: "Unit 5", unitNumber: 5, title: "Solving System of Linear Equations: Gauss Elimination & Gauss Jordan Methods" }
        ]
      },
      {
        id: "phy5ej307_m2",
        number: 2,
        title: "Basic Statistics and Descriptive Measures",
        topics: [
          { id: "phy5ej307_m2_u6", code: "Unit 6", unitNumber: 6, title: "Measures of Central Tendency" },
          { id: "phy5ej307_m2_u7", code: "Unit 7", unitNumber: 7, title: "Measures of Dispersion" },
          { id: "phy5ej307_m2_u8", code: "Unit 8", unitNumber: 8, title: "Measures of Skewness" },
          { id: "phy5ej307_m2_u9", code: "Unit 9", unitNumber: 9, title: "Measures of Kurtosis" },
          { id: "phy5ej307_m2_u10", code: "Unit 10", unitNumber: 10, title: "Correlation and Regression" }
        ]
      },
      {
        id: "phy5ej307_m3",
        number: 3,
        title: "Theory of Probability",
        topics: [
          { id: "phy5ej307_m3_u11", code: "Unit 11", unitNumber: 11, title: "Classical and Empirical Probability" },
          { id: "phy5ej307_m3_u12", code: "Unit 12", unitNumber: 12, title: "Events, Algebra of Events" },
          { id: "phy5ej307_m3_u13", code: "Unit 13", unitNumber: 13, title: "Classical Approach to Probability, Axiomatic Definitions, Simple Problems" },
          { id: "phy5ej307_m3_u14", code: "Unit 14", unitNumber: 14, title: "Theorems of Probability: Addition Theorem, Multiplication Theorem" },
          { id: "phy5ej307_m3_u15", code: "Unit 15", unitNumber: 15, title: "Conditional Probability" },
          { id: "phy5ej307_m3_u16", code: "Unit 16", unitNumber: 16, title: "Bayes' Theorem and Geometrical Probability – Examples and Problems" }
        ]
      },
      {
        id: "phy5ej307_m4",
        number: 4,
        title: "Advanced Probability Distributions & Hypothesis Testing",
        topics: [
          { id: "phy5ej307_m4_u17", code: "Unit 17", unitNumber: 17, title: "Discrete and Continuous Random Variables and Probability Distributions" },
          { id: "phy5ej307_m4_u18", code: "Unit 18", unitNumber: 18, title: "Binomial Distribution: Definition, Expectation, Variance, MGF and Problems" },
          { id: "phy5ej307_m4_u19", code: "Unit 19", unitNumber: 19, title: "Poisson Distribution: Definition, Expectation, Variance, MGF and Problems" },
          { id: "phy5ej307_m4_u20", code: "Unit 20", unitNumber: 20, title: "Normal Distribution: Definition, Expectation, Variance, Standard Normal Curve" },
          { id: "phy5ej307_m4_u21", code: "Unit 21", unitNumber: 21, title: "Testing of Hypothesis: General Principles of Testing, Two Types of Errors" },
          { id: "phy5ej307_m4_u22", code: "Unit 22", unitNumber: 22, title: "Types of Testing: T-Test, ANOVA-Test, Chi-Square Test (Basics)" }
        ]
      },
      {
        id: "phy5ej307_m5",
        number: 5,
        title: "Open Ended Module",
        topics: [
          { id: "phy5ej307_m5_u1", code: "OE1", unitNumber: 1, title: "Real-World Data Science & Statistical Estimation Projects" }
        ]
      }
    ]
  },
  {
    id: "phy5ej308",
    code: "PHY5EJ308",
    title: "Exploratory Data Analysis using Python",
    subject: "physics",
    type: "elective",
    textbook: "Doing Data Science, Cathy O'Neil & Rachel Schutt & Machine Learning in Data Science using Python, Dr. R. Nageswara Rao",
    modules: [
      {
        id: "phy5ej308_m1",
        number: 1,
        title: "Introduction to Data Science",
        topics: [
          { id: "phy5ej308_m1_u1", code: "Unit 1", unitNumber: 1, title: "Introduction to Data Science – Definition" },
          { id: "phy5ej308_m1_u2", code: "Unit 2", unitNumber: 2, title: "Evolution of Data Science" },
          { id: "phy5ej308_m1_u3", code: "Unit 3", unitNumber: 3, title: "Data Science Roles" },
          { id: "phy5ej308_m1_u4", code: "Unit 4", unitNumber: 4, title: "Applications of Data Science" }
        ]
      },
      {
        id: "phy5ej308_m2",
        number: 2,
        title: "Data Collection and Data Pre-Processing",
        topics: [
          { id: "phy5ej308_m2_u5", code: "Unit 5", unitNumber: 5, title: "Data and Data Attributes, Types of Data & Data Attributes" },
          { id: "phy5ej308_m2_u6", code: "Unit 6", unitNumber: 6, title: "Data Collection Strategies" },
          { id: "phy5ej308_m2_u7", code: "Unit 7", unitNumber: 7, title: "Data Pre-Processing, Data Cleaning" },
          { id: "phy5ej308_m2_u8", code: "Unit 8", unitNumber: 8, title: "Data Integration and Transformation" },
          { id: "phy5ej308_m2_u9", code: "Unit 9", unitNumber: 9, title: "Data Reduction and Discretization" }
        ]
      },
      {
        id: "phy5ej308_m3",
        number: 3,
        title: "Data Analysis and Manipulation using Pandas",
        topics: [
          { id: "phy5ej308_m3_u10", code: "Unit 10", unitNumber: 10, title: "Introducing Different Data File Formats: CSV, XLS, TAB, DAT" },
          { id: "phy5ej308_m3_u11", code: "Unit 11", unitNumber: 11, title: "Series – Constructing from Array, Indices, Dictionary" },
          { id: "phy5ej308_m3_u12", code: "Unit 12", unitNumber: 12, title: "DataFrame – Constructing from Arrays, Dictionaries, Structured Arrays, Indexing" },
          { id: "phy5ej308_m3_u13", code: "Unit 13", unitNumber: 13, title: "Arithmetic and Binary Operations on DataFrame" },
          { id: "phy5ej308_m3_u14", code: "Unit 14", unitNumber: 14, title: "Broadcasting Operations" },
          { id: "phy5ej308_m3_u15", code: "Unit 15", unitNumber: 15, title: "Universal Functions, melt() and pivot()" }
        ]
      },
      {
        id: "phy5ej308_m4",
        number: 4,
        title: "Data Visualization using Seaborn",
        topics: [
          { id: "phy5ej308_m4_u16", code: "Unit 16", unitNumber: 16, title: "Review of Data Visualization using Matplotlib" },
          { id: "phy5ej308_m4_u17", code: "Unit 17", unitNumber: 17, title: "Loading Datasets in Seaborn, Distribution Plot" },
          { id: "phy5ej308_m4_u18", code: "Unit 18", unitNumber: 18, title: "Count Plot, Box Plot, Scatter Plot, Joint Plot" },
          { id: "phy5ej308_m4_u19", code: "Unit 19", unitNumber: 19, title: "Line Plot, Displaying Scatter Plot with Regression Line" },
          { id: "phy5ej308_m4_u20", code: "Unit 20", unitNumber: 20, title: "Creating Subplots" },
          { id: "phy5ej308_m4_u21", code: "Unit 21", unitNumber: 21, title: "Heatmap – Cat Plot" },
          { id: "phy5ej308_m4_u22", code: "Unit 22", unitNumber: 22, title: "Violin Plot – Pair Plot" }
        ]
      },
      {
        id: "phy5ej308_m5",
        number: 5,
        title: "Open Ended Module: Geospatial & Interactive Visualization",
        topics: [
          { id: "phy5ej308_m5_u1", code: "OE1", unitNumber: 1, title: "Hands-on Data Visualization with Pandas & Matplotlib (Histogram, Density, Violin Plots)" },
          { id: "phy5ej308_m5_u2", code: "OE2", unitNumber: 2, title: "Plotting Geospatial Data: Geoplotlib, Choropleth Plots, GeoJSON & Folium Google Maps" },
          { id: "phy5ej308_m5_u3", code: "OE3", unitNumber: 3, title: "Interactive Visualizations with Bokeh (Interfaces, Bokeh Server, Adding Widgets)" }
        ]
      }
    ]
  },
  {
    id: "phy5ej309",
    code: "PHY4CJ205(ASTRO)",
    title: "Astrophysics",
    subject: "physics",
    type: "elective",
    textbook: "Introduction to Astronomy and Cosmology, Ian Morison, John Wiley & Sons (2008)",
    modules: [
      {
        id: "phy5ej309_m1",
        number: 1,
        title: "Astronomical Parameters and Tools",
        topics: [
          { id: "phy5ej309_m1_u1", code: "Unit 1", unitNumber: 1, title: "The Celestial Sphere, The Constellations, The Celestial Coordinate System" },
          { id: "phy5ej309_m1_u2", code: "Unit 2", unitNumber: 2, title: "Stellar Luminosity, Stellar Distances, The Parsec, Cepheid Variable Distance Scale" },
          { id: "phy5ej309_m1_u3", code: "Unit 3", unitNumber: 3, title: "Stellar Magnitudes: Apparent & Absolute Magnitude Scales, Standard Formula" },
          { id: "phy5ej309_m1_u4", code: "Unit 4", unitNumber: 4, title: "Colour and Surface Temperature, Stellar Photometry, Stellar Spectra, Spectral Types, Parallax" },
          { id: "phy5ej309_m1_u5", code: "Unit 5", unitNumber: 5, title: "Basics of Refracting Telescopes – Resolution, Magnification, Newtonian Telescope" },
          { id: "phy5ej309_m1_u6", code: "Unit 6", unitNumber: 6, title: "Active and Adaptive Optics" }
        ]
      },
      {
        id: "phy5ej309_m2",
        number: 2,
        title: "The Sun and HR Diagram",
        topics: [
          { id: "phy5ej309_m2_u7", code: "Unit 7", unitNumber: 7, title: "The Sun: Overall Properties, Total Energy Output, Fraunhofer Lines in Solar Spectrum" },
          { id: "phy5ej309_m2_u8", code: "Unit 8", unitNumber: 8, title: "Nuclear Fusion, The Proton-Proton Cycle" },
          { id: "phy5ej309_m2_u9", code: "Unit 9", unitNumber: 9, title: "The Solar Neutrino Problem, Solar Atmosphere, Chromosphere and Corona" },
          { id: "phy5ej309_m2_u10", code: "Unit 10", unitNumber: 10, title: "Solar Wind, Sun's Magnetic Field, Sunspot Cycle, Prominences, Flares & Interaction with Earth" },
          { id: "phy5ej309_m2_u11", code: "Unit 11", unitNumber: 11, title: "Hertzsprung-Russell (HR) Diagram: Main Sequence, Giant, White Dwarf Regions, Mass-Luminosity & Lifetimes" }
        ]
      },
      {
        id: "phy5ej309_m3",
        number: 3,
        title: "Stellar Evolution",
        topics: [
          { id: "phy5ej309_m3_u12", code: "Unit 12", unitNumber: 12, title: "Stellar Evolution: Low Mass Stars, Mid Mass Stars, Moving up Main Sequence" },
          { id: "phy5ej309_m3_u13", code: "Unit 13", unitNumber: 13, title: "The Triple Alpha Process, Helium Flash, Variable Stars" },
          { id: "phy5ej309_m3_u14", code: "Unit 14", unitNumber: 14, title: "Planetary Nebula, White Dwarfs, Black Dwarfs, Sun-like Star Evolution, Binary Systems – Algol Paradox" },
          { id: "phy5ej309_m3_u15", code: "Unit 15", unitNumber: 15, title: "High Mass Stars (>8 Solar Masses), Type II Supernova, Crab Nebula, Neutron Stars & Black Holes" },
          { id: "phy5ej309_m3_u16", code: "Unit 16", unitNumber: 16, title: "Discovery of Pulsars, Pulsars in Universe, Detection of Stellar Mass Black Holes" }
        ]
      },
      {
        id: "phy5ej309_m4",
        number: 4,
        title: "Galaxies and the Universe",
        topics: [
          { id: "phy5ej309_m4_u17", code: "Unit 17", unitNumber: 17, title: "The Milky Way, Open Clusters, Globular Clusters, Interstellar Medium, Emission Nebulae" },
          { id: "phy5ej309_m4_u18", code: "Unit 18", unitNumber: 18, title: "Size, Shape and Structure of Milky Way, Super-Massive Black Hole at Galactic Center" },
          { id: "phy5ej309_m4_u19", code: "Unit 19", unitNumber: 19, title: "Other Galaxies: Elliptical, Spiral, Dark Matter Evidence, Irregular Galaxies, Hubble Classification" },
          { id: "phy5ej309_m4_u20", code: "Unit 20", unitNumber: 20, title: "Active Galaxies, Groups and Clusters of Galaxies, Superclusters, Large Scale Structure" },
          { id: "phy5ej309_m4_u21", code: "Unit 21", unitNumber: 21, title: "Big Bang Models, Expansion of Universe, Cosmological Redshift, Steady State Model" },
          { id: "phy5ej309_m4_u22", code: "Unit 22", unitNumber: 22, title: "Cosmic Microwave Background (CMB), Discovery of CMB, Inflation, Formation of Primeval Elements" }
        ]
      },
      {
        id: "phy5ej309_m5",
        number: 5,
        title: "Open Ended Module: Virtual Observatory",
        topics: [
          { id: "phy5ej309_m5_u1", code: "OE1", unitNumber: 1, title: "Virtual Observatory Tools, Vizier, CDS, NED, SDSS Data Handling & Exoplanet Analysis" }
        ]
      }
    ]
  },
  {
    id: "phy5fs112",
    code: "PHY5FS112",
    title: "Python for Data Analysis",
    subject: "physics",
    type: "sec",
    textbook: "Core Python Programming (2nd Ed), Dr. R. Nageswara Rao & Data Science and Machine Learning using Python, Dr. Reema Thareja",
    modules: [
      {
        id: "phy5fs112_m1",
        number: 1,
        title: "Python Core Programming",
        topics: [
          { id: "phy5fs112_m1_u1", code: "Unit 1", unitNumber: 1, title: "Python – Variables, Operators, Data Types (Numerical, List & List Operations)" },
          { id: "phy5fs112_m1_u2", code: "Unit 2", unitNumber: 2, title: "Tuples, Sets, Dictionaries, input(), File Operations (open - close)" },
          { id: "phy5fs112_m1_u3", code: "Unit 3", unitNumber: 3, title: "Conditional & Control Statements – break & continue" },
          { id: "phy5fs112_m1_u4", code: "Unit 4", unitNumber: 4, title: "Functions: Define Functions, Passing Arguments, Return Values, Min/Max Hands-on" },
          { id: "phy5fs112_m1_u5", code: "Unit 5", unitNumber: 5, title: "NumPy – Arrays Creation, Access, Operations & 3x3 Arithmetic Hands-on" }
        ]
      },
      {
        id: "phy5fs112_m2",
        number: 2,
        title: "Pandas DataFrame",
        topics: [
          { id: "phy5fs112_m2_u6", code: "Unit 6", unitNumber: 6, title: "Python DataFrame – Create DataFrame" },
          { id: "phy5fs112_m2_u7", code: "Unit 7", unitNumber: 7, title: "DataFrame Attributes – Pivoting DataFrame, Sort by Labels" },
          { id: "phy5fs112_m2_u8", code: "Unit 8", unitNumber: 8, title: "Missing Data – fill, drop, replace, Combining DataFrames, describe(), Min/Max Index" },
          { id: "phy5fs112_m2_u9", code: "Unit 9", unitNumber: 9, title: "Statistical Values – count, mode, Covariance, Correlation, Quantiles" },
          { id: "phy5fs112_m2_u10", code: "Unit 10", unitNumber: 10, title: "Aggregation – Grouping Columns, Data Wrangling, Merging, Joining, Concatenating & Capacitor / Phyphox Hands-on" }
        ]
      },
      {
        id: "phy5fs112_m3",
        number: 3,
        title: "Visualisation Tools",
        topics: [
          { id: "phy5fs112_m3_u11", code: "Unit 11", unitNumber: 11, title: "Importance of Data Visualisation – Bar Chart (Capacitor / Phyphox Data)" },
          { id: "phy5fs112_m3_u12", code: "Unit 12", unitNumber: 12, title: "Histogram, Frequency Polygon, Box Plot, Scatter Plot with Formatting (Liquid Lens Data)" },
          { id: "phy5fs112_m3_u13", code: "Unit 13", unitNumber: 13, title: "Correlation Matrix Plot – Sonometer Mass vs Length^2 Hands-on" },
          { id: "phy5fs112_m3_u14", code: "Unit 14", unitNumber: 14, title: "Seaborn Library – Features, Color Palette, Univariate Distribution Plot" },
          { id: "phy5fs112_m3_u15", code: "Unit 15", unitNumber: 15, title: "Seaborn – Histogram, Density Plot, Bivariate Distribution Plots, Hexbin, Violin Plots (Iris Dataset)" },
          { id: "phy5fs112_m3_u16", code: "Unit 16", unitNumber: 16, title: "Statistical Estimation – Bar Plot, Categorical Data, Heatmap with cmap" }
        ]
      },
      {
        id: "phy5fs112_m4",
        number: 4,
        title: "Data File Formats",
        topics: [
          { id: "phy5fs112_m4_u17", code: "Unit 17", unitNumber: 17, title: "Series and DataFrames – CSV, XLS, TAB, DAT File Formats" },
          { id: "phy5fs112_m4_u18", code: "Unit 18", unitNumber: 18, title: "Viewing DataFrame using loc and iloc – Operations on DataFrames" },
          { id: "phy5fs112_m4_u19", code: "Unit 19", unitNumber: 19, title: "Jupyter Notebooks using Anaconda and Google Colab Introduction" }
        ]
      },
      {
        id: "phy5fs112_m5",
        number: 5,
        title: "Open Ended Module: Additional Training",
        topics: [
          { id: "phy5fs112_m5_u1", code: "OE1", unitNumber: 1, title: "Data File Creation: Simple Pendulum CSV Generation with Length & Period" },
          { id: "phy5fs112_m5_u2", code: "OE2", unitNumber: 2, title: "File Read & Plot: Pendulum Mean Period & Seaborn Regression Line" },
          { id: "phy5fs112_m5_u3", code: "OE3", unitNumber: 3, title: "Pandas Merge & Group By: Hooke's Law Spring Constant Verification" },
          { id: "phy5fs112_m5_u4", code: "OE4", unitNumber: 4, title: "Visualisation Tools in Pandas & Seaborn Regplot Extensions" }
        ]
      }
    ]
  }
];

export function getSem5Courses(subject: 'mathematics' | 'physics'): Sem5CourseDef[] {
  return SEM5_SYLLABUS_DATA.filter(c => c.subject === subject);
}

export function getSem5DefaultCoreCourses(subject: 'mathematics' | 'physics'): string[] {
  return SEM5_SYLLABUS_DATA
    .filter(c => c.subject === subject && (c.type === 'core' || c.type === 'sec'))
    .map(c => c.id);
}

export function findSem5CourseById(courseId: string): Sem5CourseDef | undefined {
  return SEM5_SYLLABUS_DATA.find(c => c.id === courseId);
}
