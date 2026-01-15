export interface Student {
    id: string;
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    gender: string;
    classId: string;
    matriculeNumber: string;
    parentPhoneNumber: string;
    address: string;
    isActive: boolean;
}

export interface Class {
    id: string;
    name: string;
    level: string;
    schoolYearId: string;
}

export interface SchoolYear {
    id: string;
    name: string;
    isActive: boolean;
}