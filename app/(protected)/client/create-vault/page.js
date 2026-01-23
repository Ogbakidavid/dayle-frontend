// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { Label } from "@/components/ui/label";
// import {
//   Plus,
//   Trash2,
//   Lock,
//   ShieldCheck,
//   ListChecks,
//   Users,
//   ArrowRight,
//   ArrowLeft,
//   Check,
//   Hash,
//   DollarSign,
//   TrendingDown,
//   AlertCircle,
// } from "lucide-react";
// import { cn } from "@/lib/utils";
// import { motion, AnimatePresence } from "framer-motion";
// import { VAULT_PURPOSE_MAPPING } from "@/lib/constants";

// const variants = {
//   enter: (direction) => ({
//     x: direction > 0 ? 1000 : -1000,
//     opacity: 0,
//     scale: 0.95,
//   }),
//   center: {
//     zIndex: 1,
//     x: 0,
//     opacity: 1,
//     scale: 1,
//   },
//   exit: (direction) => ({
//     zIndex: 0,
//     x: direction < 0 ? 1000 : -1000,
//     opacity: 0,
//     scale: 0.95,
//   }),
// };

// export default function CreateVaultPage() {
//   const router = useRouter();
//   const [isDeploying, setIsDeploying] = useState(false);
//   const [[page, direction], setPage] = useState([1, 0]);
//   const step = page;

//   const paginate = (newDirection) => {
//     setPage([page + newDirection, newDirection]);
//   };

//   // Step 1 State
//   const [vaultPurpose, setVaultPurpose] = useState("");
//   const [vaultTitle, setVaultTitle] = useState("");
//   const [vaultDescription, setVaultDescription] = useState("");
//   const [budgetAmount, setBudgetAmount] = useState(""); // string input
//   const [totalAmount, setTotalAmount] = useState(0);

//   // Step 3 State
//   const [freelancerEmail, setFreelancerEmail] = useState("");
//   const [freelancerName, setFreelancerName] = useState("");

//   const [milestones, setMilestones] = useState([
//     {
//       title: "",
//       amount: "",
//       dueDate: "",
//       deliverableType: "",
//       aiVerificationEnabled: true,
//       requirementItemsJson: [],
//     },
//   ]);

//   const steps = [
//     { id: 1, name: "Basics", icon: Hash },
//     { id: 2, name: "Milestones", icon: ListChecks },
//     { id: 3, name: "Assign", icon: Users },
//     { id: 4, name: "Review", icon: ShieldCheck },
//   ];

//   // ✅ FIX: numeric budget for comparisons & calculations
//   const budget = Number(budgetAmount) || 0;

//   // ✅ Helper: deliverable labels
//   const getDeliverableLabel = (deliverableId) => {
//     const list = VAULT_PURPOSE_MAPPING[vaultPurpose]?.deliverables || [];
//     return list.find((d) => d.id === deliverableId)?.label || deliverableId;
//   };

//   /* -----------------------------
//      VALIDATION LOGIC
//   --------------------------------*/

//   // ✅ Recommendation: description NOT required (you asked this)
//   const isStep1Complete =
//     vaultTitle.trim() !== "" && vaultPurpose !== "" && budget > 0;

//   const isStep2Complete =
//     milestones.length > 0 &&
//     milestones.every(
//       (m) => m.title.trim() !== "" && m.amount !== "" && m.deliverableType !== ""
//     ) &&
//     totalAmount <= budget;

//   const isStep3Complete =
//     freelancerEmail.trim() !== "" &&
//     /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(freelancerEmail);

//   const canContinue =
//     step === 1
//       ? isStep1Complete
//       : step === 2
//         ? isStep2Complete
//         : step === 3
//           ? isStep3Complete
//           : true;

//   const addMilestone = () => {
//     setMilestones([
//       ...milestones,
//       {
//         title: "",
//         amount: "",
//         dueDate: "",
//         deliverableType: "",
//         aiVerificationEnabled: true,
//         requirementItemsJson: [],
//       },
//     ]);
//   };

//   const removeMilestone = (index) => {
//     setMilestones(milestones.filter((_, i) => i !== index));
//   };

//   const updateMilestone = (index, field, value) => {
//     const updated = [...milestones];
//     updated[index][field] = value;
//     setMilestones(updated);

//     // Update total amount
//     const total = updated.reduce(
//       (acc, curr) => acc + (Number(curr.amount) || 0),
//       0
//     );
//     setTotalAmount(total);
//   };

//   const handleDeploy = () => {
//     setIsDeploying(true);

//     // ⚠️ This is still a demo action. Replace with API call later.
//     setTimeout(() => {
//       router.push("/checkout/new-vault-id");
//     }, 1200);
//   };

//   return (
//     <div className="min-h-screen bg-[#0A0A0A] py-8 md:py-12 px-3 md:px-4">
//       <div className="max-w-3xl mx-auto">
//         {/* Header */}
//         <div className="mb-8 md:mb-12 text-center">
//           <motion.h1
//             initial={{ opacity: 0, y: -20 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="text-2xl md:text-3xl font-black text-white mb-3 tracking-tighter uppercase"
//           >
//             Create New Vault
//           </motion.h1>
//           <motion.p
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ delay: 0.2 }}
//             className="text-white/70 text-sm md:text-base font-bold uppercase tracking-wide"
//           >
//             Set deliverables and review checkpoints for escrow release
//           </motion.p>
//         </div>

//         {/* Progress Tracker */}
//         <div className="flex items-center justify-between mb-12 md:mb-16 relative px-2">
//           <motion.div
//             initial={{ scaleX: 0 }}
//             animate={{ scaleX: 1 }}
//             transition={{ duration: 0.8, ease: "circOut" }}
//             className="absolute top-1/2 left-0 w-full h-[1px] bg-white/5 -translate-y-1/2 origin-left"
//           />
//           {steps.map((s, i) => (
//             <div
//               key={s.id}
//               className="relative z-10 flex flex-col items-center gap-2 md:gap-3"
//             >
//               <motion.div
//                 initial={{ scale: 0 }}
//                 animate={{ scale: 1 }}
//                 transition={{ delay: i * 0.1 }}
//                 className={cn(
//                   "w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center border transition-all duration-300",
//                   step === s.id
//                     ? "bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.2)]"
//                     : step > s.id
//                       ? "bg-emerald-500 text-white border-emerald-500"
//                       : "bg-black border-gray-800 text-white/50"
//                 )}
//               >
//                 {step > s.id ? (
//                   <Check className="w-3 h-3 md:w-4 md:h-4" />
//                 ) : (
//                   <s.icon className="w-3 h-3 md:w-4 md:h-4" />
//                 )}
//               </motion.div>

//               <motion.span
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 transition={{ delay: 0.4 + i * 0.1 }}
//                 className={cn(
//                   "text-xs md:text-sm uppercase tracking-wide font-medium",
//                   step === s.id ? "text-white" : "text-white"
//                 )}
//               >
//                 {s.name}
//               </motion.span>
//             </div>
//           ))}
//         </div>

//         {/* Form Container */}
//         <div className="relative overflow-hidden min-h-[600px]">
//           <AnimatePresence initial={false} custom={direction} mode="wait">
//             <motion.div
//               key={page}
//               custom={direction}
//               variants={variants}
//               initial="enter"
//               animate="center"
//               exit="exit"
//               transition={{
//                 x: { type: "spring", stiffness: 300, damping: 30 },
//                 opacity: { duration: 0.2 },
//               }}
//               className="bg-[#0D0D0D] border border-gray-900 rounded-lg p-8 shadow-xl w-full"
//             >
//               {/* STEP 1 */}
//               {step === 1 && (
//                 <div className="space-y-8">
//                   <div className="space-y-4">
//                     <Label className="text-sm font-bold uppercase tracking-wide text-white-200">
//                       What work are you securing payment for? *
//                     </Label>
//                     <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
//                       {Object.entries(VAULT_PURPOSE_MAPPING).map(([key, value], idx) => {
//                         const Icon = value.icon;
//                         return (
//                           <motion.button
//                             key={key}
//                             initial={{ opacity: 0, y: 20 }}
//                             animate={{ opacity: 1, y: 0 }}
//                             transition={{ delay: idx * 0.05 }}
//                             whileHover={{
//                               scale: 1.05,
//                               backgroundColor: "rgba(16, 185, 129, 0.1)",
//                             }}
//                             whileTap={{ scale: 0.95 }}
//                             onClick={() => setVaultPurpose(key)}
//                             className={cn(
//                               "flex flex-col items-center gap-3 p-4 border rounded-md transition-all",
//                               vaultPurpose === key
//                                 ? "border-emerald-500 bg-emerald-500/5 text-emerald-400"
//                                 : "border-gray-800 bg-black text-white/50 hover:border-gray-700"
//                             )}
//                           >
//                             <Icon className="w-6 h-6" />
//                             <span className="text-sm font-bold uppercase tracking-wide">
//                               {value.label}
//                             </span>
//                           </motion.button>
//                         );
//                       })}
//                     </div>
//                   </div>

//                   <div className="space-y-4">
//                     <div className="space-y-2">
//                       <Label className="text-sm text-white-200 font-bold uppercase tracking-wide">
//                         Vault Title *
//                       </Label>
//                       <Input
//                         value={vaultTitle}
//                         onChange={(e) => setVaultTitle(e.target.value)}
//                         placeholder="e.g., Q1 Mobile App Sprint"
//                         className="bg-black border-gray-800 h-12 focus:border-emerald-500 text-white placeholder:text-gray-400"
//                       />
//                     </div>

//                     <div className="space-y-2">
//                       <Label className="text-sm text-white-200 font-bold uppercase tracking-wide">
//                         Contract Budget *
//                       </Label>
//                       <div className="relative">
//                         <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
//                         <Input
//                           type="number"
//                           value={budgetAmount}
//                           onChange={(e) => setBudgetAmount(e.target.value)}
//                           placeholder="0.00"
//                           className="bg-black border-gray-800 h-12 pl-10 focus:border-emerald-500 text-white placeholder:text-gray-400"
//                         />
//                       </div>
//                     </div>

//                     <div className="space-y-2">
//                       <Label className="text-sm text-white-200 font-bold uppercase tracking-wide">
//                         Brief Description
//                       </Label>
//                       <Textarea
//                         value={vaultDescription}
//                         onChange={(e) => setVaultDescription(e.target.value)}
//                         placeholder="Describe the overall scope and deliverables...."
//                         className="bg-black border-gray-800 min-h-[120px] focus:border-emerald-500 text-white placeholder:text-gray-400"
//                       />
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {/* STEP 2 */}
//               {step === 2 && (
//                 <div className="space-y-6">
//                   <div className="flex justify-between items-center mb-4">
//                     <h2 className="text-xl font-bold uppercase tracking-tight text-white underline decoration-emerald-500/50 underline-offset-8">
//                       {VAULT_PURPOSE_MAPPING[vaultPurpose]?.label} Milestones
//                     </h2>
//                   </div>

//                   {/* Budget Tracker */}
//                   <div className="bg-[#0A0A0A] border border-gray-800 p-5 rounded-xl space-y-3">
//                     <div className="flex justify-between items-end">
//                       <div className="space-y-1">
//                         <p className="text-sm uppercase text-white-500 font-black tracking-wide">
//                           Allocation Tracker
//                         </p>
//                         <p
//                           className={cn(
//                             "text-lg font-bold tracking-tight",
//                             totalAmount > budget ? "text-red-500" : "text-white"
//                           )}
//                         >
//                           ${totalAmount.toLocaleString()}{" "}
//                           <span className="text-white-600 font-medium text-sm">
//                             / ${budget.toLocaleString()}
//                           </span>
//                         </p>
//                       </div>

//                       <div className="text-right">
//                         {totalAmount > budget ? (
//                           <div className="flex items-center gap-1.5 text-red-500 animate-pulse">
//                             <AlertCircle className="w-3 h-3" />
//                             <span className="text-sm font-black uppercase tracking-wide">
//                               Over Budget
//                             </span>
//                           </div>
//                         ) : (
//                           <div className="flex items-center gap-1.5 text-emerald-500">
//                             <TrendingDown className="w-3 h-3" />
//                             <span className="text-sm font-black uppercase tracking-wide">
//                               ${(budget - totalAmount).toLocaleString()} Remaining
//                             </span>
//                           </div>
//                         )}
//                       </div>
//                     </div>

//                     <div className="h-1.5 bg-gray-900 rounded-full overflow-hidden shadow-inner">
//                       <motion.div
//                         className={cn(
//                           "h-full rounded-full shadow-[0_0_10px_rgba(16,185,129,0.3)]",
//                           totalAmount > budget ? "bg-red-500" : "bg-emerald-500"
//                         )}
//                         initial={{ width: 0 }}
//                         animate={{
//                           width: `${
//                             budget > 0
//                               ? Math.min((totalAmount / budget) * 100, 100)
//                               : 0
//                           }%`,
//                         }}
//                         transition={{ duration: 0.5, ease: "circOut" }}
//                       />
//                     </div>
//                   </div>

//                   <div className="space-y-4">
//                     <AnimatePresence>
//                       {milestones.map((m, i) => (
//                         <motion.div
//                           key={i}
//                           initial={{ opacity: 0, height: 0 }}
//                           animate={{ opacity: 1, height: "auto" }}
//                           exit={{ opacity: 0, height: 0, marginBottom: 0 }}
//                           className="bg-black border border-gray-800 p-6 rounded-lg space-y-4 relative group overflow-hidden"
//                         >
//                           <div className="flex justify-between items-center">
//                             <span className="text-sm text-emerald-500 font-bold uppercase tracking-tighter">
//                               Phase 0{i + 1}
//                             </span>

//                             {milestones.length > 1 && (
//                               <button onClick={() => removeMilestone(i)}>
//                                 <Trash2 className="w-4 h-4 text-white hover:text-red-500 transition-colors" />
//                               </button>
//                             )}
//                           </div>

//                           <div className="grid grid-cols-1 gap-4">
//                             <Input
//                               placeholder="What is being delivered?"
//                               value={m.title}
//                               onChange={(e) =>
//                                 updateMilestone(i, "title", e.target.value)
//                               }
//                               className="bg-[#0A0A0A] border-gray-800 text-white h-11 placeholder:text-gray-400"
//                             />

//                             {/* Escrow-safe rules (Mandatory Requirements) */}
//                             <div className="space-y-4 pt-2">
//                               {/* Mandatory Client Approval */}
//                               <div className="flex items-center justify-between p-3 bg-[#0A0A0A] border border-gray-800 rounded-lg">
//                                 <div className="space-y-0.5">
//                                   <Label className="text-xs font-bold uppercase tracking-wider text-white">
//                                     Client Approval Required
//                                   </Label>
//                                   <p className="text-[10px] text-gray-500 uppercase font-bold">
//                                     Mandatory for all payout releases
//                                   </p>
//                                 </div>
//                                 <div className="flex items-center gap-2 text-emerald-500">
//                                   <ShieldCheck className="w-4 h-4" />
//                                   <span className="text-[10px] font-black uppercase tracking-widest">
//                                     ALWAYS ON
//                                   </span>
//                                 </div>
//                               </div>

//                               {/* Mandatory AI Verification Audit */}
//                               <div className="flex items-center justify-between p-3 bg-[#0A0A0A] border border-gray-800 rounded-lg">
//                                 <div className="space-y-0.5">
//                                   <Label className="text-xs font-bold uppercase tracking-wider text-white">
//                                     AI Verification Audit
//                                   </Label>
//                                   <p className="text-[10px] text-gray-500 uppercase font-bold">
//                                     Automated checks for deliverable quality
//                                   </p>
//                                 </div>
//                                 <div className="flex items-center gap-2 text-emerald-500">
//                                   <ShieldCheck className="w-4 h-4" />
//                                   <span className="text-[10px] font-black uppercase tracking-widest">
//                                     ALWAYS ON
//                                   </span>
//                                 </div>
//                               </div>
//                             </div>

//                             <div className="grid grid-cols-2 gap-4">
//                               <div className="relative">
//                                 <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 text-sm">
//                                   $
//                                 </span>
//                                 <Input
//                                   type="number"
//                                   placeholder="Amount"
//                                   value={m.amount}
//                                   onChange={(e) =>
//                                     updateMilestone(i, "amount", e.target.value)
//                                   }
//                                   className="bg-[#0A0A0A] border-gray-800 text-white pl-7 h-11 placeholder:text-gray-400"
//                                 />
//                               </div>

//                               <Input
//                                 type="date"
//                                 value={m.dueDate}
//                                 onChange={(e) =>
//                                   updateMilestone(i, "dueDate", e.target.value)
//                                 }
//                                 className="bg-[#0A0A0A] border-gray-800 text-white h-11 [color-scheme:dark]"
//                               />
//                             </div>

//                             <div className="space-y-2">
//                               <Label className="text-sm text-white/70 uppercase font-bold tracking-wide">
//                                 Deliverable Type
//                               </Label>

//                               <select
//                                 value={m.deliverableType}
//                                 onChange={(e) => {
//                                   const deliverables =
//                                     VAULT_PURPOSE_MAPPING[vaultPurpose]?.deliverables ||
//                                     [];

//                                   const selected = deliverables.find(
//                                     (d) => d.id === e.target.value
//                                   );

//                                   const generateReqId = () => {
//                                     if (typeof crypto !== "undefined" && crypto.randomUUID) {
//                                       return crypto.randomUUID();
//                                     }
//                                     return `req_${Math.random().toString(36).substring(2, 11)}_${Date.now()}`;
//                                   };

//                                   const requirements = (selected?.rules || []).map((rule, idx) => ({
//                                     reqId: generateReqId(),
//                                     label: rule,
//                                     required: true
//                                   }));

//                                   updateMilestone(i, "deliverableType", selected?.id || "");
//                                   updateMilestone(i, "requirementItemsJson", requirements);
//                                 }}
//                                 className="w-full bg-[#0A0A0A] border border-gray-800 text-white p-3 text-sm rounded-md focus:border-emerald-500 outline-none font-bold uppercase tracking-wide"
//                               >
//                                 <option value="">
//                                   Choose deliverable for{" "}
//                                   {VAULT_PURPOSE_MAPPING[vaultPurpose]?.label}
//                                 </option>
//                                 {VAULT_PURPOSE_MAPPING[vaultPurpose]?.deliverables.map(
//                                   (d) => (
//                                     <option key={d.id} value={d.id}>
//                                       {d.label}
//                                     </option>
//                                   )
//                                 )}
//                               </select>
//                             </div>

//                             {/* ✅ Show audit protocol only if AI is ON */}
//                             {m.aiVerificationEnabled && m.requirementItemsJson.length > 0 && (
//                               <div className="bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-md">
//                                 <div className="flex items-center gap-2 mb-2">
//                                   <ShieldCheck className="w-3 h-3 text-emerald-500" />
//                                   <p className="text-sm text-emerald-500 font-bold uppercase tracking-wide">
//                                     Automated Verification Protocol
//                                   </p>
//                                 </div>
//                                 <ul className="space-y-1">
//                                   {m.requirementItemsJson.map((r, idx) => (
//                                     <li
//                                       key={r.reqId}
//                                       className="text-sm text-white/70 flex items-center gap-2"
//                                     >
//                                       <div className="w-1 h-1 bg-emerald-500 rounded-full" />
//                                       {r.label}
//                                     </li>
//                                   ))}
//                                 </ul>
//                               </div>
//                             )}
//                           </div>
//                         </motion.div>
//                       ))}
//                     </AnimatePresence>
//                   </div>

//                   <Button
//                     variant="outline"
//                     onClick={addMilestone}
//                     className="w-full border-dashed border-gray-800 text-white/70 hover:text-white hover:bg-white/5 h-12 text-sm font-bold uppercase tracking-wide"
//                   >
//                     <Plus className="w-4 h-4 mr-2" /> Add Next Milestone
//                   </Button>
//                 </div>
//               )}

//               {/* STEP 3 */}
//               {step === 3 && (
//                 <div className="space-y-8">
//                   <div className="text-center mb-8">
//                     <motion.div
//                       initial={{ scale: 0 }}
//                       animate={{ scale: 1 }}
//                       type="spring"
//                       className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4"
//                     >
//                       <Users className="w-8 h-8 text-emerald-500" />
//                     </motion.div>

//                     <h2 className="text-xl font-black uppercase tracking-tight text-white">
//                       Who is this vault for?
//                     </h2>

//                     <p className="text-white/70 text-sm mt-1 font-bold uppercase tracking-wide">
//                       Assign a freelancer to begin the collaboration.
//                     </p>
//                   </div>

//                   <div className="space-y-6">
//                     <div className="space-y-2">
//                       <Label className="text-sm text-white-200 font-bold uppercase tracking-wide">
//                         Freelancer Email Address *
//                       </Label>
//                       <Input
//                         type="email"
//                         value={freelancerEmail}
//                         onChange={(e) => setFreelancerEmail(e.target.value)}
//                         placeholder="freelancer@example.com"
//                         className="bg-black border-gray-800 h-12 focus:border-emerald-500 text-white placeholder:text-gray-400"
//                       />
//                       <p className="text-sm text-white/50">
//                         If they don&apos;t have an account, they&apos;ll be invited to join.
//                       </p>
//                     </div>

//                     <div className="space-y-2">
//                       <Label className="text-sm text-white-200 font-bold uppercase tracking-wide">
//                         Freelancer Name (Optional)
//                       </Label>
//                       <Input
//                         value={freelancerName}
//                         onChange={(e) => setFreelancerName(e.target.value)}
//                         placeholder="e.g., Jane Doe"
//                         className="bg-black border-gray-800 h-12 focus:border-emerald-500 text-white placeholder:text-gray-400"
//                       />
//                     </div>

//                     <div className="bg-white/5 border border-white/10 p-4 rounded-lg flex gap-4">
//                       <div className="p-2 bg-emerald-500/20 rounded-md h-fit">
//                         <ShieldCheck className="w-5 h-5 text-emerald-500" />
//                       </div>
//                       <div>
//                         <h4 className="text-sm font-medium text-white">
//                           Secure Invitation
//                         </h4>
//                         <p className="text-sm text-white/70 mt-1 leading-relaxed">
//                           The freelancer receives an invite to accept the vault terms.
//                           Funds stay locked until the client approves each milestone.
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {/* STEP 4 */}
//               {step === 4 && (
//                 <div className="space-y-8">
//                   <div className="flex items-center justify-between mb-2">
//                     <h2 className="text-xl font-black uppercase tracking-tight text-white">
//                       Review Vault Setup
//                     </h2>
//                     <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
//                       <span className="text-emerald-500 text-sm font-bold uppercase tracking-wide">
//                         Ready to Deploy
//                       </span>
//                     </div>
//                   </div>

//                   <div className="space-y-4">
//                     {/* Basic Summary */}
//                     <div className="bg-black border border-gray-800 p-6 rounded-lg space-y-4">
//                       <div className="flex justify-between items-start">
//                         <div>
//                           <h3 className="text-sm font-medium text-white/50 uppercase tracking-wide">
//                             Vault Title
//                           </h3>
//                           <p className="text-lg text-white font-bold uppercase tracking-wide mt-1">
//                             {vaultTitle}
//                           </p>
//                         </div>

//                         <div className="text-right">
//                           <h3 className="text-sm font-medium text-white/50 uppercase tracking-wide">
//                             Total Value
//                           </h3>
//                           <p className="text-2xl text-emerald-500 font-bold mt-1">
//                             ${totalAmount.toLocaleString()}
//                           </p>
//                         </div>
//                       </div>

//                       <div>
//                         <h3 className="text-sm font-medium text-white/50 uppercase tracking-wide">
//                           Purpose
//                         </h3>
//                         <div className="flex items-center gap-2 mt-1">
//                           {(() => {
//                             const Icon = VAULT_PURPOSE_MAPPING[vaultPurpose]?.icon || Hash;
//                             return <Icon className="w-4 h-4 text-emerald-500" />;
//                           })()}
//                           <span className="text-sm text-white">
//                             {VAULT_PURPOSE_MAPPING[vaultPurpose]?.label}
//                           </span>
//                         </div>
//                       </div>

//                       {/* ✅ If description exists, show it HERE so it’s not wasted */}
//                       {vaultDescription.trim() !== "" && (
//                         <div>
//                           <h3 className="text-sm font-medium text-white/50 uppercase tracking-wide">
//                             Description
//                           </h3>
//                           <p className="text-sm text-white/80 leading-relaxed mt-1">
//                             {vaultDescription}
//                           </p>
//                         </div>
//                       )}
//                     </div>

//                     {/* Freelancer Summary */}
//                     <div className="bg-black border border-gray-800 p-4 rounded-lg flex items-center justify-between">
//                       <div className="flex items-center gap-3">
//                         <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center">
//                           <Users className="w-5 h-5 text-white/70" />
//                         </div>
//                         <div>
//                           <p className="text-sm text-white/50 uppercase font-bold tracking-wide">
//                             Assigned Freelancer
//                           </p>
//                           <p className="text-sm text-white font-bold uppercase tracking-normal">
//                             {freelancerName || "Unnamed Freelancer"}
//                           </p>
//                           <p className="text-sm text-white/70">{freelancerEmail}</p>
//                         </div>
//                       </div>
//                     </div>

//                     {/* Milestones Summary */}
//                     <div className="space-y-3">
//                       <h3 className="text-sm text-white/50 uppercase font-bold tracking-wide ml-1">
//                         Milestones ({milestones.length})
//                       </h3>

//                       {milestones.map((m, i) => (
//                         <div
//                           key={i}
//                           className="bg-black border border-gray-800 p-4 rounded-lg flex items-center justify-between"
//                         >
//                           <div className="flex items-center gap-4">
//                             <div className="w-8 h-8 rounded-full border border-gray-800 flex items-center justify-center text-sm text-white/70 font-mono">
//                               0{i + 1}
//                             </div>

//                             <div>
//                               <p className="text-sm text-white font-bold uppercase tracking-normal">
//                                 {m.title}
//                               </p>

//                               <div className="flex flex-wrap items-center gap-2 mt-1">
//                                 <span className="text-sm text-white/70 font-semibold">
//                                   {getDeliverableLabel(m.deliverableType)}
//                                 </span>

//                                 <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-sm border border-emerald-500/30 text-emerald-500">
//                                   AI Verification: ALWAYS ON
//                                 </span>

//                                 <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-sm border border-emerald-500/30 text-emerald-500">
//                                   Client Approval Required
//                                 </span>
//                               </div>
//                             </div>
//                           </div>

//                           <div className="text-right">
//                             <p className="text-sm text-white font-mono font-bold">
//                               ${Number(m.amount).toLocaleString()}
//                             </p>
//                             <p className="text-sm text-white/70 mt-1">
//                               {m.dueDate || "No due date"}
//                             </p>
//                           </div>
//                         </div>
//                       ))}
//                     </div>

//                     {/* Disclaimer */}
//                     <div className="bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-lg flex gap-4">
//                       <div className="p-2 bg-emerald-500/20 rounded-md h-fit">
//                         <ShieldCheck className="w-5 h-5 text-emerald-500" />
//                       </div>
//                       <div>
//                         <h4 className="text-sm font-bold text-emerald-500 uppercase tracking-wide">
//                           Escrow Verification Protocol
//                         </h4>
//                         <p className="text-sm text-white-300 mt-1 leading-relaxed">
//                           Release is secured by a joint protocol:{" "}
//                           <span className="text-white font-medium">
//                             Mandatory AI Audit
//                           </span>{" "}
//                           validates deliverable integrity, but{" "}
//                           <span className="text-white font-medium">
//                             Client Approval
//                           </span>{" "}
//                           is strictly required for all fund releases.
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {/* NAVIGATION */}
//               <div className="flex flex-col-reverse sm:flex-row justify-between gap-3 mt-12 pt-6 border-t border-gray-900">
//                 <Button
//                   variant="ghost"
//                   onClick={() => paginate(-1)}
//                   disabled={step === 1}
//                   className="text-white/70 hover:text-white font-bold uppercase tracking-wide w-full sm:w-auto"
//                 >
//                   <ArrowLeft className="w-4 h-4 mr-2" /> Back
//                 </Button>

//                 {step < 4 ? (
//                   <Button
//                     onClick={() => paginate(1)}
//                     disabled={!canContinue}
//                     className={cn(
//                       "px-8 h-11 transition-all text-sm w-full sm:w-auto",
//                       canContinue
//                         ? "bg-white text-black hover:bg-emerald-500 hover:text-white font-bold uppercase tracking-wide"
//                         : "bg-gray-800 text-white cursor-not-allowed"
//                     )}
//                   >
//                     Continue <ArrowRight className="w-4 h-4 ml-2" />
//                   </Button>
//                 ) : (
//                   <Button
//                     onClick={handleDeploy}
//                     disabled={isDeploying}
//                     className="w-full sm:w-auto bg-emerald-500 text-black px-10 h-11 hover:bg-emerald-400 shadow-lg shadow-emerald-500/20 disabled:opacity-90 disabled:cursor-not-allowed transition-all font-bold uppercase tracking-wide"
//                   >
//                     {isDeploying ? (
//                       <div className="flex items-center gap-1 font-bold">
//                         <span>Deploying</span>
//                         <motion.span
//                           initial={{ opacity: 0 }}
//                           animate={{ opacity: 1 }}
//                           transition={{
//                             duration: 0.4,
//                             repeat: Infinity,
//                             repeatType: "reverse",
//                             delay: 0,
//                           }}
//                         >
//                           .
//                         </motion.span>
//                         <motion.span
//                           initial={{ opacity: 0 }}
//                           animate={{ opacity: 1 }}
//                           transition={{
//                             duration: 0.4,
//                             repeat: Infinity,
//                             repeatType: "reverse",
//                             delay: 0.2,
//                           }}
//                         >
//                           .
//                         </motion.span>
//                         <motion.span
//                           initial={{ opacity: 0 }}
//                           animate={{ opacity: 1 }}
//                           transition={{
//                             duration: 0.4,
//                             repeat: Infinity,
//                             repeatType: "reverse",
//                             delay: 0.4,
//                           }}
//                         >
//                           .
//                         </motion.span>
//                       </div>
//                     ) : (
//                       "Deploy Vault"
//                     )}
//                   </Button>
//                 )}
//               </div>
//             </motion.div>
//           </AnimatePresence>
//         </div>

//         {/* Footer */}
//         <div className="mt-8 flex items-center justify-center gap-2 text-white/30">
//           <Lock className="w-3 h-3" />
//           <span className="text-sm uppercase tracking-wide font-bold">
//             Secured by Dayle Escrow Protocol
//           </span>
//         </div>
//       </div>
//     </div>
//   );
// }



"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Plus,
  Trash2,
  Lock,
  ShieldCheck,
  ListChecks,
  Users,
  ArrowRight,
  ArrowLeft,
  Check,
  Hash,
  DollarSign,
  TrendingDown,
  AlertCircle,
  Calendar,
  LayoutDashboard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { VAULT_PURPOSE_MAPPING } from "@/lib/constants";

const variants = {
  enter: (direction) => ({
    x: direction > 0 ? 20 : -20,
    opacity: 0,
    filter: "blur(10px)",
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
    filter: "blur(0px)",
  },
  exit: (direction) => ({
    zIndex: 0,
    x: direction < 0 ? 20 : -20,
    opacity: 0,
    filter: "blur(10px)",
  }),
};

export default function CreateVaultPage() {
  const router = useRouter();
  const [isDeploying, setIsDeploying] = useState(false);
  const [[page, direction], setPage] = useState([1, 0]);
  const step = page;

  const paginate = (newDirection) => {
    setPage([page + newDirection, newDirection]);
  };

  // State
  const [vaultPurpose, setVaultPurpose] = useState("");
  const [vaultTitle, setVaultTitle] = useState("");
  const [vaultDescription, setVaultDescription] = useState("");
  const [budgetAmount, setBudgetAmount] = useState("");
  const [totalAmount, setTotalAmount] = useState(0);
  const [freelancerEmail, setFreelancerEmail] = useState("");
  const [freelancerName, setFreelancerName] = useState("");

  const [milestones, setMilestones] = useState([
    {
      title: "",
      amount: "",
      dueDate: "",
      deliverableType: "",
      aiVerificationEnabled: true,
      requirementItemsJson: [],
    },
  ]);

  const steps = [
    { id: 1, name: "Basics", icon: Hash },
    { id: 2, name: "Milestones", icon: ListChecks },
    { id: 3, name: "Assign", icon: Users },
    { id: 4, name: "Review", icon: ShieldCheck },
  ];

  const budget = Number(budgetAmount) || 0;

  const getDeliverableLabel = (deliverableId) => {
    const list = VAULT_PURPOSE_MAPPING[vaultPurpose]?.deliverables || [];
    return list.find((d) => d.id === deliverableId)?.label || deliverableId;
  };

  // Validation
  const isStep1Complete = vaultTitle.trim() !== "" && vaultPurpose !== "" && budget > 0;
  const isStep2Complete = milestones.length > 0 && milestones.every(m => m.title.trim() !== "" && m.amount !== "" && m.deliverableType !== "") && totalAmount <= budget;
  const isStep3Complete = freelancerEmail.trim() !== "" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(freelancerEmail);

  const canContinue = step === 1 ? isStep1Complete : step === 2 ? isStep2Complete : step === 3 ? isStep3Complete : true;

  const updateMilestone = (index  , field, value) => {
    const updated = [...milestones];
    updated[index][field] = value;
    setMilestones(updated);
    setTotalAmount(updated.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0));
  };

  const handleDeploy = () => {
    setIsDeploying(true);
    setTimeout(() => {
      router.push("/checkout/new-vault-id");
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-emerald-500/30 selection:text-emerald-400">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative max-w-4xl mx-auto px-6 py-12 lg:py-20">
        
        {/* Header Section */}
        <header className="mb-12 text-center md:text-left flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-4">
              <Lock className="w-3 h-3" /> Secure Escrow Vault
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic">
              New <span className="text-emerald-500">Vault</span>
            </h1>
          </div>

          {/* Stepper (Desktop) */}
          <nav className="hidden md:flex items-center gap-4 bg-white/5 p-2 rounded-2xl border border-white/10 backdrop-blur-md">
            {steps.map((s) => (
              <div
                key={s.id}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl transition-all",
                  step === s.id ? "bg-white text-black font-bold" : "text-white/40"
                )}
              >
                <s.icon className="w-4 h-4" />
                <span className="text-xs uppercase tracking-widest">{s.name}</span>
              </div>
            ))}
          </nav>
        </header>

        {/* Main Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <main className="lg:col-span-8">
            <div className="relative min-h-[500px] bg-[#0A0A0A] border border-white/5 rounded-3xl p-8 shadow-2xl backdrop-blur-xl overflow-hidden">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={page}
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  {/* STEP 1: BASICS */}
                  {step === 1 && (
                    <div className="space-y-8">
                      <div className="space-y-4">
                        <Label className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">1. Select Project Type</Label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {Object.entries(VAULT_PURPOSE_MAPPING).map(([key, value]) => {
                            const Icon = value.icon;
                            const isActive = vaultPurpose === key;
                            return (
                              <button
                                key={key}
                                onClick={() => setVaultPurpose(key)}
                                className={cn(
                                  "group relative flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all duration-300",
                                  isActive 
                                    ? "bg-emerald-500/10 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.1)]" 
                                    : "bg-white/[0.02] border-white/5 hover:border-white/20"
                                )}
                              >
                                <Icon className={cn("w-6 h-6 transition-transform group-hover:scale-110", isActive ? "text-emerald-500" : "text-white/30")} />
                                <span className={cn("text-[10px] font-bold uppercase tracking-widest", isActive ? "text-white" : "text-white/40")}>
                                  {value.label}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-2">
                          <Label className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold italic">2. Contract Identity</Label>
                          <Input
                            value={vaultTitle}
                            onChange={(e) => setVaultTitle(e.target.value)}
                            placeholder="PROJECT TITLE"
                            className="bg-white/[0.03] border-white/5 h-14 text-lg font-bold placeholder:text-white/10 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold italic">3. Total Allocation</Label>
                          <div className="relative group">
                            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500 group-focus-within:animate-pulse" />
                            <Input
                              type="number"
                              value={budgetAmount}
                              onChange={(e) => setBudgetAmount(e.target.value)}
                              placeholder="0.00"
                              className="bg-white/[0.03] border-white/5 h-14 pl-12 text-xl font-mono focus:border-emerald-500/50 rounded-xl"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold italic">4. Brief Description</Label>
                            <Textarea
                                value={vaultDescription}
                                onChange={(e) => setVaultDescription(e.target.value)}
                                placeholder="Describe the overall scope..."
                                className="bg-white/[0.03] border-white/5 min-h-[120px] focus:border-emerald-500/50 rounded-xl text-white/80"
                            />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 2: MILESTONES */}
                  {step === 2 && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between border-b border-white/5 pb-4">
                        <h2 className="text-xs font-black uppercase tracking-[0.3em] text-emerald-500">Phases & Governance</h2>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setMilestones([...milestones, { title: "", amount: "", dueDate: "", deliverableType: "", aiVerificationEnabled: true, requirementItemsJson: [] }])}
                          className="text-[10px] uppercase tracking-widest hover:bg-emerald-500/10 hover:text-emerald-400"
                        >
                          <Plus className="w-3 h-3 mr-2" /> Add Phase
                        </Button>
                      </div>

                      <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
                        {milestones.map((m, i) => (
                          <div key={i} className="group relative bg-white/[0.02] border border-white/5 hover:border-white/10 p-5 rounded-2xl transition-all">
                            <div className="flex items-start justify-between gap-4 mb-4">
                              <div className="flex-1">
                                <Input
                                  placeholder={`Phase 0${i+1} Deliverable Name`}
                                  value={m.title}
                                  onChange={(e) => updateMilestone(i, "title", e.target.value)}
                                  className="bg-transparent border-none p-0 text-sm font-bold uppercase tracking-wider placeholder:text-white/20 h-auto focus-visible:ring-0"
                                />
                              </div>
                              <button onClick={() => setMilestones(milestones.filter((_, idx) => idx !== i))} className="opacity-0 group-hover:opacity-100 p-1 text-white/20 hover:text-red-500 transition-all">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3 mb-4">
                              <div className="bg-black/40 rounded-xl p-3 border border-white/[0.03]">
                                <Label className="text-[9px] uppercase text-white/30 font-bold block mb-1">Release Amount</Label>
                                <div className="flex items-center gap-2">
                                  <DollarSign className="w-3 h-3 text-emerald-500" />
                                  <input 
                                    type="number" 
                                    value={m.amount}
                                    onChange={(e) => updateMilestone(i, "amount", e.target.value)}
                                    className="bg-transparent border-none text-sm font-mono focus:outline-none w-full" 
                                    placeholder="0"
                                  />
                                </div>
                              </div>
                              <div className="bg-black/40 rounded-xl p-3 border border-white/[0.03]">
                                <Label className="text-[9px] uppercase text-white/30 font-bold block mb-1">Deadline</Label>
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-3 h-3 text-blue-500" />
                                  <input 
                                    type="date" 
                                    value={m.dueDate}
                                    onChange={(e) => updateMilestone(i, "dueDate", e.target.value)}
                                    className="bg-transparent border-none text-[11px] focus:outline-none w-full [color-scheme:dark]" 
                                  />
                                </div>
                              </div>
                            </div>

                            <select
                                value={m.deliverableType}
                                onChange={(e) => updateMilestone(i, "deliverableType", e.target.value)}
                                className="w-full bg-black/40 border border-white/5 text-[10px] p-3 rounded-xl focus:border-emerald-500/50 outline-none font-bold uppercase tracking-widest text-white/60"
                            >
                                <option value="">Select Deliverable Type</option>
                                {VAULT_PURPOSE_MAPPING[vaultPurpose]?.deliverables.map((d) => (
                                    <option key={d.id} value={d.id}>{d.label}</option>
                                ))}
                            </select>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* STEP 3: ASSIGN */}
                  {step === 3 && (
                    <div className="max-w-md mx-auto py-10 space-y-8">
                      <div className="text-center space-y-2">
                          <div className="w-20 h-20 bg-emerald-500/10 rounded-3xl rotate-12 flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
                            <Users className="w-10 h-10 text-emerald-500 -rotate-12" />
                          </div>
                          <h2 className="text-2xl font-black uppercase italic tracking-tighter">Assign Operator</h2>
                          <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Identify the vault beneficiary</p>
                      </div>
                      
                      <div className="space-y-4">
                          <Input 
                            value={freelancerEmail}
                            onChange={(e) => setFreelancerEmail(e.target.value)}
                            placeholder="OPERATOR EMAIL" 
                            className="bg-white/[0.03] border-white/5 h-14 rounded-xl text-center font-bold tracking-widest"
                          />
                          <Input 
                            value={freelancerName}
                            onChange={(e) => setFreelancerName(e.target.value)}
                            placeholder="FULL NAME (OPTIONAL)" 
                            className="bg-white/[0.03] border-white/5 h-14 rounded-xl text-center font-bold tracking-widest"
                          />
                          <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 flex gap-3 items-center">
                            <ShieldCheck className="w-5 h-5 text-blue-500 shrink-0" />
                            <p className="text-[10px] text-blue-200/60 leading-relaxed uppercase font-bold">
                              Vault protocol will verify user identity upon acceptance.
                            </p>
                          </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 4: REVIEW */}
                  {step === 4 && (
                    <div className="space-y-8">
                      <div className="flex items-center justify-between">
                        <h2 className="text-xl font-black uppercase tracking-tighter italic">Confirm Deployment</h2>
                        <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                          <span className="text-emerald-500 text-[10px] font-black uppercase tracking-widest">Protocol Verified</span>
                        </div>
                      </div>

                      {/* Header Summary */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl">
                          <Label className="text-[9px] uppercase text-white/30 tracking-widest block mb-1">Total Value</Label>
                          <p className="text-2xl font-black text-emerald-500 font-mono">${totalAmount.toLocaleString()}</p>
                        </div>
                        <div className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl">
                          <Label className="text-[9px] uppercase text-white/30 tracking-widest block mb-1">Beneficiary</Label>
                          <p className="text-sm font-bold truncate text-white uppercase tracking-wider">{freelancerEmail}</p>
                        </div>
                      </div>

                      {/* Milestones Ledger */}
                      <div className="space-y-3">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">Manifest ({milestones.length} Phases)</h3>
                        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                          {milestones.map((m, i) => (
                            <div key={i} className="bg-black/40 border border-white/[0.05] p-4 rounded-xl flex items-center justify-between group">
                              <div className="flex items-center gap-4">
                                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[10px] text-white/40 font-mono border border-white/5">
                                  0{i + 1}
                                </div>
                                <div>
                                  <p className="text-xs font-black uppercase tracking-widest text-white">{m.title}</p>
                                  <div className="flex items-center gap-3 mt-1">
                                    <span className="text-[9px] text-emerald-500/70 font-bold uppercase tracking-widest">{getDeliverableLabel(m.deliverableType)}</span>
                                    <span className="text-[8px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-black uppercase">AI AUDIT ON</span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-xs font-mono font-black text-white">${Number(m.amount).toLocaleString()}</p>
                                <p className="text-[9px] text-white/20 uppercase font-bold mt-1">{m.dueDate || "NO DATE"}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Final Security Disclaimer */}
                      <div className="bg-emerald-500/5 border border-emerald-500/10 p-5 rounded-2xl flex gap-4">
                        <div className="p-2 bg-emerald-500/20 rounded-xl h-fit">
                          <ShieldCheck className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div>
                          <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Escrow Verification Protocol</h4>
                          <p className="text-[10px] text-white/50 mt-1 leading-relaxed uppercase font-bold">
                            Funds are locked in a smart vault. Release requires <span className="text-white">AI Deliverable Audit</span> and <span className="text-white">Manual Client Sign-off</span>.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation Controls */}
            <div className="mt-8 flex flex-col-reverse sm:flex-row items-center justify-between gap-4 pt-6 border-t border-white/5">
              <Button
                variant="ghost"
                onClick={() => paginate(-1)}
                disabled={step === 1 || isDeploying}
                className="text-white/40 hover:text-white uppercase text-[10px] font-black tracking-widest w-full sm:w-auto"
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>

              {step < 4 ? (
                <Button
                  onClick={() => paginate(1)}
                  disabled={!canContinue}
                  className={cn(
                    "h-12 px-10 rounded-xl font-black uppercase tracking-widest transition-all w-full sm:w-auto",
                    canContinue ? "bg-white text-black hover:bg-emerald-500 hover:text-white" : "bg-white/5 text-white/20"
                  )}
                >
                  Continue <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleDeploy}
                  disabled={isDeploying}
                  className="h-12 px-12 bg-emerald-500 text-black rounded-xl font-black uppercase tracking-widest hover:bg-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.3)] w-full sm:w-auto disabled:opacity-50"
                >
                  {isDeploying ? (
                    <div className="flex items-center gap-2">
                      <span className="animate-pulse">Initializing Vault</span>
                      <div className="flex gap-1">
                        {[0, 1, 2].map((i) => (
                          <motion.span
                            key={i}
                            animate={{ opacity: [0, 1, 0] }}
                            transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                            className="w-1 h-1 bg-black rounded-full"
                          />
                        ))}
                      </div>
                    </div>
                  ) : "Deploy Vault"}
                </Button>
              )}
            </div>
          </main>

          {/* Sidebar Info */}
          <aside className="hidden lg:block lg:col-span-4 space-y-6 sticky top-12">
            <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-6 italic">Live Allocation</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <span className="text-2xl font-black font-mono">${totalAmount}</span>
                  <span className="text-[10px] text-white/20 uppercase font-bold">of ${budget}</span>
                </div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    className={cn("h-full", totalAmount > budget ? "bg-red-500" : "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]")}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((totalAmount/budget)*100 || 0, 100)}%` }}
                  />
                </div>
                {totalAmount > budget && (
                  <div className="flex items-center gap-2 text-red-500 animate-pulse">
                    <AlertCircle className="w-3 h-3" />
                    <span className="text-[9px] font-black uppercase">Budget Overflow</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-blue-500/5 border border-blue-500/10 rounded-3xl p-6">
              <div className="flex items-center gap-3 mb-4 text-blue-400">
                <LayoutDashboard className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Protocol Insight</span>
              </div>
              <p className="text-[11px] text-blue-200/50 leading-relaxed font-bold uppercase italic">
                Vault initialization generates a unique smart contract address. funds stay locked until verify.
              </p>
            </div>
          </aside>
        </div>

        {/* Footer */}
        <div className="mt-12 flex items-center justify-center gap-3 text-white/20">
          <Lock className="w-3 h-3" />
          <span className="text-[10px] uppercase tracking-[0.3em] font-black">
            Secured by Dayle Escrow Protocol
          </span>
        </div>
      </div>
    </div>
  );
}
