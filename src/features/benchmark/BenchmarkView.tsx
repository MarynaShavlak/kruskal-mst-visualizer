import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function BenchmarkView() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Бенчмарк</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        Порівняння наївної (has-path) та DSU-версій: лічильник операцій, жива
        складність і графіки у Web Worker. Буде реалізовано у Фазі 5.
      </CardContent>
    </Card>
  )
}
