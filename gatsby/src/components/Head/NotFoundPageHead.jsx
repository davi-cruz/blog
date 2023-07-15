import * as React from "react";
import { isRtlLang } from "../../functions/localeUtils";

const NotFoundPageHead = ({ locale, title }) => {
  const isRtl = isRtlLang(locale);

  return (
    <>
      <html lang={locale} dir={isRtl ? "rtl" : "ltr"} />
      <link rel="icon" href="/favicon-32.png" type="image/png" />
      <title>{title}</title>
    </>
  );
};

export default NotFoundPageHead;
