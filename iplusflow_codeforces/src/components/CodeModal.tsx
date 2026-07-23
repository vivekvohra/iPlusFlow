import { useEffect, useRef, useState } from "react";
import { fetchSubmissionCodeDetails } from "../utils/friendsCode";
import type { CodeModalProps } from "../types";

export default function CodeModal({
    contestId,
    submissionId,
    handle,
    language,
    onClose,
}: CodeModalProps) {
    const [code, setCode] = useState<string>("");
    const [subUrl, setSubUrl] = useState<string>(`https://codeforces.com/contest/${contestId}/submission/${submissionId}`);
    const [langClass, setLangClass] = useState<string>("lang-cpp");
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const isMounted = useRef(true);

    useEffect(() => {
        isMounted.current = true;
        setIsLoading(true);

        const getCode = async () => {
            const details = await fetchSubmissionCodeDetails(contestId, submissionId, language);
            if (isMounted.current) {
                setCode(details.code);
                setSubUrl(details.subUrl);
                setLangClass(details.langClass);
                setIsLoading(false);
            }
        };

        getCode();

        return () => {
            isMounted.current = false;
        };
    }, [contestId, submissionId, language]);

    useEffect(() => {
        if (!isLoading && code && isMounted.current) {
            // Give React time to commit the <pre className="prettyprint ..."> element to the DOM
            const timer = setTimeout(() => {
                if ((window as any).PR && typeof (window as any).PR.prettyPrint === 'function') {
                    try { (window as any).PR.prettyPrint(); } catch (e) {}
                }
            }, 30);
            return () => clearTimeout(timer);
        }
    }, [isLoading, code]);

    return (
        <div className="iplus_modal">
            <div className="iplus_modal-content">
                <span className="iplus_close-button" onClick={onClose}>
                    ×
                </span>
                <h3>Code for {handle} (Submission #{submissionId})</h3>

                {isLoading ? (
                    <p>Fetching friend's code...</p>
                ) : (
                    <div className="friend-code-block">
                        <strong>
                            <a
                                href={`https://codeforces.com/profile/${handle}`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {handle}
                            </a>
                        </strong>
                        {" – "}
                        <a
                            href={subUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Submission {submissionId}
                        </a>
                        <pre className={`prettyprint linenums ${langClass}`}>
                            {code}
                        </pre>
                    </div>
                )}
            </div>
        </div>
    );
}
