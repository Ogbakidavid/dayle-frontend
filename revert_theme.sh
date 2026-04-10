#!/bin/bash
files=(
  "app/(protected)/client/(with-sidebar)/layout.tsx"
  "app/(protected)/client/(with-sidebar)/page.tsx"
  "app/(protected)/client/create-vault/page.tsx"
  "app/(protected)/client/(with-sidebar)/ledger/page.tsx"
  "app/(protected)/client/(with-sidebar)/vaults/page.tsx"
)

for file in "${files[@]}"; do
  sed -i 's/to-emerald-900\/20/to-slate-50/g' "$file"
  sed -i 's/from-emerald-950/from-white/g' "$file"
  sed -i 's/bg-white\/10/bg-slate-100/g' "$file"
  sed -i 's/bg-white\/5/bg-slate-50/g' "$file"
  sed -i 's/border-white\/5/border-slate-100/g' "$file"
  sed -i 's/border-white\/10/border-slate-200/g' "$file"
  sed -i 's/text-white\/50/text-slate-500/g' "$file"
  sed -i 's/text-white\/70/text-slate-600/g' "$file"
  sed -i 's/text-white\/90/text-slate-800/g' "$file"
  sed -i 's/\btext-white\b/text-slate-900/g' "$file"
  sed -i 's/bg-emerald-900\/20/bg-white/g' "$file"
  sed -i 's/bg-emerald-950/bg-\[#F8F9FA\]/g' "$file"
done
