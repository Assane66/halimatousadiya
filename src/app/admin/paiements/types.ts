
export interface Student {
    id: string;
    firstName: string;
    lastName: string;
    matriculeNumber: string;
    // Add other student fields if needed for display
}

export interface Payment {
    id: string;
    studentId: string;
    amount: number;
    type: string;
    date: Date;
    schoolYearId: string;
}

export interface SchoolYear {
    id: string;
    name: string;
    isActive: boolean;
}
