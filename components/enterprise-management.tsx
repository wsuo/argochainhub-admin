"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Search, Filter, MoreHorizontal, Eye, Edit, Ban, CheckCircle, Crown, Building2, Users } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// Mock data for enterprises
const enterprises = [
  {
    id: "ENT001",
    name: "AgriCorp Solutions",
    type: "buyer",
    contact: "John Smith",
    phone: "+1-555-0123",
    email: "john@agricorp.com",
    registeredAt: "2024-01-15",
    membershipLevel: "Professional",
    expiresAt: "2025-01-15",
    status: "active",
    location: "California, USA",
  },
  {
    id: "ENT002",
    name: "ChemSupply International",
    type: "supplier",
    contact: "Maria Garcia",
    phone: "+1-555-0456",
    email: "maria@chemsupply.com",
    registeredAt: "2024-02-20",
    membershipLevel: "Enterprise",
    expiresAt: "2025-02-20",
    status: "active",
    location: "Texas, USA",
  },
  {
    id: "ENT003",
    name: "GreenTech Farming",
    type: "buyer",
    contact: "David Chen",
    phone: "+1-555-0789",
    email: "david@greentech.com",
    registeredAt: "2024-03-10",
    membershipLevel: "Basic",
    expiresAt: "2024-12-10",
    status: "pending",
    location: "Iowa, USA",
  },
  {
    id: "ENT004",
    name: "BioChemicals Ltd",
    type: "supplier",
    contact: "Sarah Johnson",
    phone: "+1-555-0321",
    email: "sarah@biochemicals.com",
    registeredAt: "2024-01-05",
    membershipLevel: "Premium",
    expiresAt: "2025-01-05",
    status: "active",
    location: "Florida, USA",
  },
]

export function EnterpriseManagement() {
  const [searchTerm, setSearchTerm] = React.useState("")
  const [typeFilter, setTypeFilter] = React.useState("all")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [selectedEnterprise, setSelectedEnterprise] = React.useState<any>(null)

  const filteredEnterprises = enterprises.filter((enterprise) => {
    const matchesSearch =
      enterprise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enterprise.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enterprise.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === "all" || enterprise.type === typeFilter
    const matchesStatus = statusFilter === "all" || enterprise.status === statusFilter

    return matchesSearch && matchesType && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            Active
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            Pending
          </Badge>
        )
      case "disabled":
        return <Badge variant="destructive">Disabled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getTypeBadge = (type: string) => {
    return type === "buyer" ? (
      <Badge variant="outline" className="bg-blue-50 text-blue-700">
        Buyer
      </Badge>
    ) : (
      <Badge variant="outline" className="bg-purple-50 text-purple-700">
        Supplier
      </Badge>
    )
  }

  const getMembershipBadge = (level: string) => {
    const colors = {
      Basic: "bg-gray-100 text-gray-800",
      Professional: "bg-blue-100 text-blue-800",
      Enterprise: "bg-purple-100 text-purple-800",
      Premium: "bg-yellow-100 text-yellow-800",
    }
    return <Badge className={colors[level as keyof typeof colors]}>{level}</Badge>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Enterprise Management</h2>
          <p className="text-muted-foreground">Manage all platform enterprises including buyers and suppliers</p>
        </div>
        <Button>
          <Users className="mr-2 h-4 w-4" />
          Add Enterprise
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Enterprises</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enterprises.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Buyers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enterprises.filter((e) => e.type === "buyer").length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suppliers</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enterprises.filter((e) => e.type === "supplier").length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enterprises.filter((e) => e.status === "pending").length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Enterprise List</CardTitle>
          <CardDescription>Search and filter enterprises by various criteria</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 items-center space-x-2">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search enterprises..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="buyer">Buyers</SelectItem>
                  <SelectItem value="supplier">Suppliers</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="disabled">Disabled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Enterprise Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Enterprise</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Membership</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Registered</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEnterprises.map((enterprise) => (
                <TableRow key={enterprise.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <div className="font-medium">{enterprise.name}</div>
                      <div className="text-sm text-muted-foreground">{enterprise.id}</div>
                    </div>
                  </TableCell>
                  <TableCell>{getTypeBadge(enterprise.type)}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <div className="font-medium">{enterprise.contact}</div>
                      <div className="text-sm text-muted-foreground">{enterprise.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {getMembershipBadge(enterprise.membershipLevel)}
                      <div className="text-xs text-muted-foreground">Expires: {enterprise.expiresAt}</div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(enterprise.status)}</TableCell>
                  <TableCell>
                    <div className="text-sm">{enterprise.registeredAt}</div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setSelectedEnterprise(enterprise)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Crown className="mr-2 h-4 w-4" />
                          Adjust Membership
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Ban className="mr-2 h-4 w-4" />
                          Disable
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Enterprise Detail Dialog */}
      <Dialog open={!!selectedEnterprise} onOpenChange={() => setSelectedEnterprise(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Enterprise Details</DialogTitle>
            <DialogDescription>
              Detailed information and management options for {selectedEnterprise?.name}
            </DialogDescription>
          </DialogHeader>

          {selectedEnterprise && (
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="accounts">Accounts</TabsTrigger>
                <TabsTrigger value="business">Business Records</TabsTrigger>
                <TabsTrigger value="logs">Operation Logs</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Enterprise Name</Label>
                    <Input value={selectedEnterprise.name} readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label>Enterprise ID</Label>
                    <Input value={selectedEnterprise.id} readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Input value={selectedEnterprise.type} readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Input value={selectedEnterprise.status} readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label>Contact Person</Label>
                    <Input value={selectedEnterprise.contact} readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input value={selectedEnterprise.phone} readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={selectedEnterprise.email} readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input value={selectedEnterprise.location} readOnly />
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button>Edit Information</Button>
                  <Button variant="outline">
                    <Crown className="mr-2 h-4 w-4" />
                    Adjust Membership
                  </Button>
                  <Button variant="outline">Reset Password</Button>
                </div>
              </TabsContent>

              <TabsContent value="accounts">
                <div className="text-center py-8 text-muted-foreground">
                  Sub-accounts management interface would be implemented here
                </div>
              </TabsContent>

              <TabsContent value="business">
                <div className="text-center py-8 text-muted-foreground">
                  Business records (inquiries, samples, registrations) would be displayed here
                </div>
              </TabsContent>

              <TabsContent value="logs">
                <div className="text-center py-8 text-muted-foreground">
                  Operation logs and audit trail would be shown here
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
