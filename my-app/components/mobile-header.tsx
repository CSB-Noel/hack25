"use client"

// star icon removed — title will be centered using CSS

import { Mulish } from "next/font/google"
const mulish = Mulish({ subsets: ["latin"], weight: ["800"] })
export function MobileHeader() {
  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="flex items-center gap-3 px-4 py-3 max-w-md mx-auto">
        <div className="flex-1 flex items-center justify-center">
          <h1 className={`text-lg title-font font-semibold ${mulish.className}`}>StellarFinance</h1>
        </div>
{/* 
        <div className="flex-1">
          <Input placeholder="Search transactions…" className="bg-card border-border text-sm h-10" />
        </div> */}

        {/* User menu */}
        {/* {session?.user && (
          <Dialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="h-10 w-10 p-0">
                <User className="w-5 h-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle>Account</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{session.user.name || "User"}</p>
                    <p className="text-sm text-muted-foreground">{session.user.email}</p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  onClick={handleLogout}
                  className="w-full"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )} */}
      </div>
    </header>
  )
}
