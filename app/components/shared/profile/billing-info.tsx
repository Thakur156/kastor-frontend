import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Crown, CreditCard } from "lucide-react";

function BillingInfo() {
  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">CURRENT PLAN</CardTitle>
          <Button className="w-44 rounded-full">
            <Crown className="mr-2 h-4 w-4" />
            Upgrade Plan
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-4xl font-bold">Pro</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Unlimited Access To The Essentails Tools For Datalake In Kastor
              </p>
            </div>
            <Button variant="outline" className="w-44 rounded-full">
              Cancel Subscription
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4">Payment Method</h3>
          <RadioGroup
            defaultValue="card"
            className="flex items-center space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="card" id="card" />
              <CreditCard className="h-5 w-5 text-muted-foreground" />
              <label
                htmlFor="card"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                **** 8256
              </label>
            </div>
          </RadioGroup>
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" className="rounded-full w-32">
              Remove
            </Button>
            <Button variant="outline" className="rounded-full w-32">
              Change Card
            </Button>
          </div>
        </CardContent>
      </Card>

      <div>
        <h3 className="text-lg font-semibold mb-4">Transactions History</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Transaction ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">#BF123973OD</TableCell>
              <TableCell>10th Aug, 2024</TableCell>
              <TableCell>Pro Subscription (1 Years)</TableCell>
              <TableCell className="text-right">$650 USD</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <div className="md:flex justify-between pt-4 !w-full gap-2 space-y-2">
        <Button variant="outline" className="rounded-full md:w-44 w-full">
          Discard Changes
        </Button>
        <Button className="rounded-full md:w-44 w-full">Save Changes</Button>
      </div>
    </>
  );
}

export default BillingInfo;
