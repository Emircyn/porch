import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { FREE_LINK_LIMIT } from "@/lib/plans"

const questions = [
  {
    q: "Do I need a card to sign up?",
    a: "No. The free plan has no time limit and asks for nothing but an e-mail address or a GitHub account.",
  },
  {
    q: "Can I change my page name later?",
    a: "Yes, from your settings. The old address stops working as soon as you change it, so update your bio links too.",
  },
  {
    q: `What happens to my links if I stop paying for Pro?`,
    a: `Nothing is deleted. Your page shows the first ${FREE_LINK_LIMIT} links and switches to a free theme until you upgrade again.`,
  },
  {
    q: "Who can see my click numbers?",
    a: "Only you. Visitors see your page, never your stats, and Porch does not use cookies to follow them around.",
  },
  {
    q: "Is Porch a real service?",
    a: "Porch is a portfolio project by Emircan Erdemci. Everything works, but payments run in Stripe test mode, so no real card is ever charged.",
  },
]

export function Faq() {
  return (
    <Accordion type="single" collapsible className="w-full">
      {questions.map((item) => (
        <AccordionItem key={item.q} value={item.q}>
          <AccordionTrigger className="py-5 text-base">{item.q}</AccordionTrigger>
          <AccordionContent className="max-w-prose text-base text-muted-foreground">
            {item.a}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
