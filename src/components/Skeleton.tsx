export const ProblemCardSkeleton = () => (
  <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm animate-pulse">
    <div className="flex gap-3 mb-6">
      <div className="h-6 w-20 bg-slate-100 rounded-full"></div>
      <div className="h-6 w-16 bg-slate-100 rounded-full"></div>
    </div>
    <div className="h-8 w-3/4 bg-slate-100 rounded-xl mb-4"></div>
    <div className="h-4 w-full bg-emerald-50 rounded-lg mb-2"></div>
    <div className="h-4 w-5/6 bg-emerald-50 rounded-lg mb-8"></div>
    <div className="flex justify-between items-center bg-emerald-50 rounded-3xl p-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-slate-200 rounded-xl"></div>
        <div className="h-4 w-24 bg-slate-200 rounded-md"></div>
      </div>
      <div className="w-12 h-12 bg-slate-200 rounded-2xl"></div>
    </div>
  </div>
);

export const DashboardStatsSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12 animate-pulse">
    {[1, 2, 3, 4].map(i => (
      <div key={i} className="h-56 bg-slate-100 border border-slate-200 rounded-[3rem] p-10">
        <div className="flex justify-between mb-8">
           <div className="w-10 h-10 bg-slate-200 rounded-2xl"></div>
           <div className="w-16 h-4 bg-slate-200 rounded-full"></div>
        </div>
        <div className="w-24 h-12 bg-slate-200 rounded-xl"></div>
      </div>
    ))}
  </div>
);
