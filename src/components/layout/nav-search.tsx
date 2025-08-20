'use client'

import { Input } from "@/components/ui/input"
import { Search, Menu } from "lucide-react"
import { useState } from "react"
import { UserProfile } from "@/components/auth/UserProfile"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Sidebar } from "./sidebar"
import { useAuth } from "@/components/auth/AuthContext"

interface NavSearchProps {
  userName?: string
}
export function NavSearch({ userName = "Gebruiker" }: NavSearchProps) {
  const [searchValue, setSearchValue] = useState('')
  const { userProfile } = useAuth()

  return (
    <div className="h-20 bg-white border-b border-gray-100">
      <div className="px-4 sm:px-8 py-4 flex items-center justify-between gap-3 sm:gap-6 h-full">
        {/* Begroeting links */}
        <div className="flex items-center gap-3 min-w-fit shrink-0">
          {/* Mobile sidebar trigger */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <button className="p-2 rounded-md border border-gray-300 text-slate-700 hover:bg-gray-100" aria-label="Menu">
                  <Menu className="h-5 w-5" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-80">
                <Sidebar companyId={userProfile?.company_id || 'unknown'} />
              </SheetContent>
            </Sheet>
          </div>
          <div className="flex flex-col justify-center">
            <span className="text-xs text-gray-500 font-normal">
              Hallo,
            </span>
            <span className="text-base text-gray-900 font-medium leading-tight">
              {userName}
            </span>
          </div>
        </div>

        {/* Zoekbalk gecentreerd */}
        <div className="flex-1 flex justify-center">
          <div className="relative w-full max-w-2xl">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Zoek een automatisering"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="h-12 pl-10 pr-4 rounded-full border-gray-200 text-sm focus:ring-0 focus:border-gray-300 bg-gray-50 focus:bg-white w-full"
            />
          </div>
        </div>

        {/* User profiel rechts */}
        <div className="flex items-center shrink-0">
          <UserProfile />
        </div>
      </div>
    </div>
  )
} 
