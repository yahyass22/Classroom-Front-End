// mockData.ts

import {Subject} from "@/types";

export const MOCK_SUBJECTS: Subject[] = [
    {
        id: 1,
        code: "CS101",
        name: "Introduction to Computer Science",
        departement: "CS",
        description: "This course introduces the fundamental concepts of computer science, including programming, data structures, and algorithms.",
        createdAt: new Date().toISOString(),
    },
    {
        id: 2,
        code: "MATH202",
        name: "Calculus II",
        departement: "Math",
        description: "This course covers the topics of integration, sequences, and series, with an emphasis on applications in physics and engineering.",
        createdAt: new Date().toISOString(),
    },
    {
        id: 3,
        code: "ENGL303",
        name: "English Literature",
        departement: "English",
        description: "This course explores the major works of English literature from the Renaissance to the present day, including plays, poems, and novels.",
        createdAt: new Date().toISOString(),
    },
];
