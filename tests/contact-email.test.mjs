import assert from "node:assert/strict";
import test from "node:test";
import { getProfessionalFollowUp, professionalInterventionFormUrl } from "../src/lib/professional-followup.ts";

test("professional acknowledgements include the exact supplied form URL in HTML and plain text", () => {
  const expected = "https://www.vieavenir.fr/formulaires/devenez-une-voix-de-l-avenir-avec-l-association-vie-avenir";
  assert.equal(professionalInterventionFormUrl, expected);
  const followUp = getProfessionalFollowUp("professional");
  assert.ok(followUp.html.includes(`href="${expected}"`));
  assert.ok(followUp.html.includes(`>${expected}</a>`), "copyable fallback link");
  assert.ok(followUp.text.includes(expected));
  assert.match(followUp.html, /Compléter le formulaire/);
  assert.match(followUp.text, /préparer vos futures interventions/);
});

for (const profile of ["young", "parent", "partner"]) {
  test(`${profile} acknowledgements receive no professional follow-up`, () => {
    assert.deepEqual(getProfessionalFollowUp(profile), { html: "", text: "" });
  });
}
