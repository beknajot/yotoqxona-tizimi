"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DeductModal } from "@/components/DeductModal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function EducatorDashboardClient({ students, sessionName }: { students: any[], sessionName: string }) {
  const [genderFilter, setGenderFilter] = useState("ALL");

  const filteredStudents = students.filter(s => {
    return genderFilter === "ALL" || s.gender === genderFilter;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Tarbiyachi Paneli: {sessionName}</h2>
          <p className="text-muted-foreground mt-2">
            Barcha o'quvchilar ro'yxati va ularning joriy axloqiy ballari
          </p>
        </div>
        
        <DeductModal students={students} />
      </div>

      <Tabs defaultValue="ALL" onValueChange={setGenderFilter} className="w-full">
        <TabsList className="grid w-full sm:w-96 grid-cols-3 mb-6">
          <TabsTrigger value="ALL">Barchasi</TabsTrigger>
          <TabsTrigger value="MALE">O'g'il bolalar</TabsTrigger>
          <TabsTrigger value="FEMALE">Qiz bolalar</TabsTrigger>
        </TabsList>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredStudents.length === 0 && (
            <div className="col-span-full py-12 text-center border rounded-lg bg-muted/20">
              Ushbu toifada o'quvchilar topilmadi.
            </div>
          )}
          {filteredStudents.map((student) => (
            <Card key={student.id} className="hover:shadow-lg transition-all relative overflow-hidden">
              <div className={`absolute top-0 left-0 w-1 h-full ${
                student.score >= 80 ? 'bg-primary' : student.score >= 50 ? 'bg-yellow-500' : 'bg-destructive'
              }`} />
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{student.name}</CardTitle>
                <div className="text-sm text-muted-foreground flex items-center justify-between">
                  <span>{student.studentId}</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between mt-4">
                  <div className="text-sm text-muted-foreground">Joriy ball</div>
                  <div className={`text-4xl font-bold ${
                    student.score >= 80 ? 'text-primary' : student.score >= 50 ? 'text-yellow-600 dark:text-yellow-500' : 'text-destructive'
                  }`}>
                    {student.score}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </Tabs>
    </div>
  );
}
