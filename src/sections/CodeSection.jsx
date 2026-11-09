import { motion } from 'framer-motion';
import VSCodeEditor from '../components/VSCodeEditor';
import { flowContainerProps, flowItemProps } from '../hooks/useSectionFlow';
import './Sections.css';

const CodeSection = () => {
    return (
        <section className="section section--certifications" id="certifications" aria-label="Certifications">
            <motion.div className="section__content container" {...flowContainerProps}>
                <div className="code-section__layout">
                    <motion.div className="code-section__editor" {...flowItemProps}>
                        <VSCodeEditor />
                    </motion.div>
                </div>
            </motion.div>
        </section>
    );
};

export default CodeSection;
