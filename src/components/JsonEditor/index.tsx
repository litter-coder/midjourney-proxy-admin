import React, { useEffect } from 'react';
import AceEditor from 'react-ace';

import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/theme-textmate';

interface JsonEditorFormItemProps {
    value?: object;
    onChange?: (value: object) => void;
}

const JsonEditor: React.FC<JsonEditorFormItemProps> = ({ value = {}, onChange }) => {
    const [textValue, setTextValue] = React.useState(JSON.stringify(value, null, 2));
    const [isValidJson, setIsValidJson] = React.useState(true);

    useEffect(() => {
        const json1 = JSON.stringify(value);
        const json2 = JSON.stringify(JSON.parse(textValue));
        if (json1 !== json2) {
            setTextValue(JSON.stringify(value, null, 2));
        }
    }, [value]);

    const handleChange = (newValue: string) => {
        setTextValue(newValue);
        try {
            const parsedValue = JSON.parse(newValue);
            setIsValidJson(true);
            if (onChange) {
                onChange(parsedValue);
            }
        } catch (error) {
            setIsValidJson(false);
        }
    };
    return (
        <div style={{ width: '100%' }}>
            <AceEditor
                mode="json"
                theme="textmate"
                value={textValue}
                onChange={handleChange}
                name="json-editor"
                editorProps={{ $blockScrolling: true }}
                height="auto"
                maxLines={Infinity}
                setOptions={{
                    enableBasicAutocompletion: true,
                    enableLiveAutocompletion: true,
                    enableSnippets: true,
                    showLineNumbers: true,
                    tabSize: 2,
                    useWorker: false,
                }}
                style={{ width: '100%', minHeight: '80px' }}
                fontSize={14}
                lineHeight={19}
                showPrintMargin={true}
                showGutter={true}
                highlightActiveLine={true}
            />
            {!isValidJson && (
                <div style={{ color: 'red', marginTop: '8px' }}>JSON 格式错误，请检查输入！</div>
            )}
        </div>
    );
};

export default JsonEditor;