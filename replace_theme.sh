#!/bin/bash
# Note: I'm using a script internally to quickly process multiple files
files=(
  "app/(protected)/client/(with-sidebar)/layout.tsx"
  "app/(protected)/client/(with-sidebar)/page.tsx"
  "app/(protected)/client/create-vault/page.tsx"
  "app/(protected)/client/(with-sidebar)/ledger/page.tsx"
  "app/(protected)/client/(with-sidebar)/vaults/page.tsx"
)

for file in "${files[@]}"; do
  sed -i 's/bg-\[#F8F9FA\]/bg-emerald-950/g' "$file"
  sed -i 's/bg-white/bg-emerald-900\/20/g' "$file"
  sed -i 's/text-slate-900/text-white/g' "$file"
  sed -i 's/text-slate-800/text-white\/90/g' "$file"
  sed -i 's/text-slate-600/text-white\/70/g' "$file"
  sed -i 's/text-slate-500/text-white\/50/g' "$file"
  sed -i 's/border-slate-200/border-white\/10/g' "$file"
  sed -i 's/border-slate-100/border-white\/5/g' "$file"
  sed -i 's/bg-slate-50/bg-white\/5/g' "$file"
  sed -i 's/bg-slate-100/bg-white\/10/g' "$file"
  sed -i 's/from-white/from-emerald-950/g' "$file"
  sed -i 's/to-slate-50/to-emerald-900\/20/g' "$file"
done
