"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DeductModal } from "@/components/DeductModal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function EducatorDashboardClient({ students, sessionName }: { students: any[], sessionName: string }) {
  const [genderFilter, setGenderFilter] = useState("ALL");
  const [classFilter, setClassFilter] = useState("ALL");

  const studentsByGender = students.filter(s => genderFilter === "ALL" || s.gender === genderFilter);
  const availableClasses = Array.from(new Set(studentsByGender.map(s => s.className))).sort();

  const filteredStudents = studentsByGender.filter(s => {
    return classFilter === "ALL" || s.className === classFilter;
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

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-6">
        <Tabs 
          defaultValue="ALL" 
          onValueChange={(v) => {
            setGenderFilter(v);
            setClassFilter("ALL");
          }} 
          className="w-full md:w-auto"
        >
          <TabsList className="grid w-full sm:w-96 grid-cols-3">
            <TabsTrigger value="ALL">Barchasi</TabsTrigger>
            <TabsTrigger value="MALE">O'g'il bolalar</TabsTrigger>
            <TabsTrigger value="FEMALE">Qiz bolalar</TabsTrigger>
          </TabsList>
        </Tabs>

        <Select value={classFilter} onValueChange={(v) => setClassFilter(v || "ALL")}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Barcha sinflar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Barcha sinflar</SelectItem>
            {availableClasses.map(c => (
              <SelectItem key={String(c)} value={String(c)}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

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
                  <span className="bg-muted px-2 py-0.5 rounded border">{student.className}</span>
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
    </div>
  );
}
