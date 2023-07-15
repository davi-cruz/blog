import { graphql, useStaticQuery } from "gatsby";

import { BackButtonIcon } from "../../Icons/BackButton";
import { usePageLocale } from "../../../../hooks/usePageLocale";
import { useTextDirection } from "../../../../hooks/useTextDirection";

import { Button } from "./styles";

export const BackToBlog = () => {
  const data = useStaticQuery(graphql`
    query {
      site {
        siteMetadata {
          textStringNodes {
            locale
            backToBlogAriaLabel
          }
          blogRootNodes {
            id: originalId
          }
        }
      }
    }
  `);

  const {
    BlogRoot: { id },
    MiscTextString: { textStringNodes },
  } = data;

  const { pageLocale } = usePageLocale();

  const nodeLocaleMatch = textStringNodes.find(
    ({ locale }) => locale === pageLocale
  );
  const { backToBlogAriaLabel } = nodeLocaleMatch;

  const { isRtl } = useTextDirection();

  return (
    <Button $isRtl={isRtl} aria-label={backToBlogAriaLabel} recordId={id}>
      <BackButtonIcon />
    </Button>
  );
};
