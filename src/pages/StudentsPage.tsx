import React, { useMemo, useState } from 'react';
import { ArrowUpDown, Phone, Search, X } from 'lucide-react';
import { useRouteMind } from '../context/RouteMindContext';
import { AttendanceStatusIndicator } from '../components/common/StatusIndicator';
import { EmptyState } from '../components/common/EmptyState';
import type { Student } from '../types/transportation';

type StudentSortField = 'studentCode' | 'name' | 'school' | 'routeCode' | 'todayStatus';

export const StudentsPage: React.FC = () => {
  const { students, routes, totalEnrolledStudents, reassignStudentRoute } = useRouteMind();
  const [searchQuery, setSearchQuery] = useState('');
  const [schoolFilter, setSchoolFilter] = useState('all');
  const [sortField, setSortField] = useState<StudentSortField>('studentCode');
  const [sortAsc, setSortAsc] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [draftRouteId, setDraftRouteId] = useState<string>('');

  const schools = useMemo(
    () => Array.from(new Set(students.map((s) => s.school))).sort(),
    [students]
  );

  const filteredStudents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = students.filter((s) => {
      if (schoolFilter !== 'all' && s.school !== schoolFilter) return false;
      if (!q) return true;
      return (
        s.name.toLowerCase().includes(q) ||
        s.studentCode.toLowerCase().includes(q) ||
        s.routeCode.toLowerCase().includes(q) ||
        s.stopName.toLowerCase().includes(q) ||
        s.guardianName.toLowerCase().includes(q)
      );
    });

    return [...list].sort((a, b) => {
      const cmp = String(a[sortField]).localeCompare(String(b[sortField]), undefined, {
        numeric: true,
      });
      return sortAsc ? cmp : -cmp;
    });
  }, [students, searchQuery, schoolFilter, sortField, sortAsc]);

  const toggleSort = (field: StudentSortField) => {
    if (sortField === field) {
      setSortAsc((prev) => !prev);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const openStudent = (student: Student) => {
    setSelectedStudent(student);
    setDraftRouteId(student.routeId);
  };

  return (
    <div className="space-y-5">
      {/* Header Toolbar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-slate-500 tabular-nums">
            Showing {filteredStudents.length} sample roster records · {totalEnrolledStudents} total
            district riders enrolled across 18 routes
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={schoolFilter}
            onChange={(e) => setSchoolFilter(e.target.value)}
            aria-label="Filter by school"
            className="h-9 px-3 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Schools</option>
            {schools.map((school) => (
              <option key={school} value={school}>
                {school}
              </option>
            ))}
          </select>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search student, ID, route, guardian..."
              aria-label="Search students"
              className="w-full h-9 pl-9 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Students Table */}
      {filteredStudents.length > 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-semibold text-slate-500">
                  <th className="py-3 px-4">
                    <button
                      type="button"
                      onClick={() => toggleSort('studentCode')}
                      className="inline-flex items-center gap-1 hover:text-slate-800"
                    >
                      <span>Student ID</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="py-3 px-4">
                    <button
                      type="button"
                      onClick={() => toggleSort('name')}
                      className="inline-flex items-center gap-1 hover:text-slate-800"
                    >
                      <span>Student</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="py-3 px-4">
                    <button
                      type="button"
                      onClick={() => toggleSort('school')}
                      className="inline-flex items-center gap-1 hover:text-slate-800"
                    >
                      <span>School & Grade</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="py-3 px-4">
                    <button
                      type="button"
                      onClick={() => toggleSort('routeCode')}
                      className="inline-flex items-center gap-1 hover:text-slate-800"
                    >
                      <span>Assigned Route & Stop</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="py-3 px-4">Guardian Contact</th>
                  <th className="py-3 px-4">
                    <button
                      type="button"
                      onClick={() => toggleSort('todayStatus')}
                      className="inline-flex items-center gap-1 hover:text-slate-800"
                    >
                      <span>Today Status</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredStudents.map((stu) => (
                  <tr
                    key={stu.id}
                    onClick={() => openStudent(stu)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 font-mono font-medium text-slate-700 tabular-nums">
                      {stu.studentCode}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{stu.name}</td>
                    <td className="py-3 px-4">
                      <p className="text-slate-800">{stu.school}</p>
                      <p className="text-[11px] text-slate-500">Grade {stu.grade}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-slate-900">
                        {stu.routeCode} · {stu.routeName}
                      </p>
                      <p className="text-[11px] text-slate-500">{stu.stopName}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-slate-800">{stu.guardianName}</p>
                      <p className="text-[11px] text-slate-500 tabular-nums">{stu.guardianPhone}</p>
                    </td>
                    <td className="py-3 px-4">
                      <AttendanceStatusIndicator status={stu.todayStatus} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState
          title="No students match your search"
          description="Clear the school filter or search input to browse the enrolled student directory."
          actionLabel="Reset Filters"
          onAction={() => {
            setSearchQuery('');
            setSchoolFilter('all');
          }}
        />
      )}

      {/* Student Detail & Route Reassignment Drawer */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="fixed inset-0 bg-slate-950/35 backdrop-blur-[1px]"
            onClick={() => setSelectedStudent(null)}
            aria-hidden="true"
          />
          <aside className="relative z-10 w-full max-w-md bg-white h-full border-l border-slate-200 shadow-2xl flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-xs text-slate-500">{selectedStudent.studentCode}</p>
                <h2 className="text-lg font-semibold text-slate-900 mt-0.5">
                  {selectedStudent.name}
                </h2>
                <p className="text-xs text-slate-500">
                  {selectedStudent.school} · Grade {selectedStudent.grade}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStudent(null)}
                aria-label="Close student details"
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 text-xs">
              <div className="p-4 border border-slate-200 rounded-lg space-y-2">
                <p className="text-slate-500">Primary Guardian</p>
                <p className="text-sm font-semibold text-slate-900">
                  {selectedStudent.guardianName}
                </p>
                <p className="text-slate-600 inline-flex items-center gap-1.5 tabular-nums">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{selectedStudent.guardianPhone}</span>
                </p>
              </div>

              <div className="p-4 border border-slate-200 rounded-lg space-y-2">
                <p className="text-slate-500">Today&apos;s Boarding Verification</p>
                <div className="flex items-center justify-between">
                  <AttendanceStatusIndicator status={selectedStudent.todayStatus} />
                  <span className="font-mono text-slate-500 tabular-nums">
                    {selectedStudent.lastBoardedAt
                      ? `Boarded ${selectedStudent.lastBoardedAt}`
                      : 'No boarding scan yet'}
                  </span>
                </div>
              </div>

              <div className="space-y-2.5 border-t border-slate-100 pt-5">
                <label className="block font-semibold text-slate-900">
                  Reassign Transportation Route
                </label>
                <select
                  value={draftRouteId}
                  onChange={(e) => setDraftRouteId(e.target.value)}
                  className="w-full h-9 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-blue-500"
                >
                  {routes
                    .filter((r) => r.status !== 'completed')
                    .map((rt) => (
                      <option key={rt.id} value={rt.id}>
                        {rt.routeCode} · {rt.routeName} ({rt.assignedBusNumber})
                      </option>
                    ))}
                </select>
                <button
                  type="button"
                  onClick={() => {
                    reassignStudentRoute(selectedStudent.id, draftRouteId);
                    const updated = routes.find((r) => r.id === draftRouteId);
                    if (updated) {
                      setSelectedStudent({
                        ...selectedStudent,
                        routeId: updated.id,
                        routeCode: updated.routeCode,
                        routeName: updated.routeName,
                      });
                    }
                  }}
                  className="w-full px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  Save Route Assignment
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};
