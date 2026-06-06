import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function LearnView() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Навчання</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        Навчальна вкладка: теорія алгоритму Краскала з живими віджетами та
        перемикачем UA/EN. Буде реалізовано у Фазі 4.
      </CardContent>
    </Card>
  )
}
