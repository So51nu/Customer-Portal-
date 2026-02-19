import React from "react";

type DialogType = "note" | "email" | "call" | "task" | "meeting";

interface ActionDialogProps {
  open: boolean;
  type: DialogType ;
  onClose: () => void;
}

const ActionDialog: React.FC<ActionDialogProps> = ({ open, type, onClose }) => {
  const getDialogConfig = () => {
    const configs = {
      note: {
        title: "New Note",
        placeholder: "Note title e.g., Summary Meeting 12 Jul 2024",
        extraFields: null
      },
      email: {
        title: "New Email",
        placeholder: "Email subject",
        extraFields: [{ label: "Recipient Email", type: "email" }]
      },
      call: {
        title: "New Call",
        placeholder: "Call title",
        extraFields: [{ label: "Phone Number", type: "tel" }]
      },
      task: {
        title: "New Task",
        placeholder: "Task title",
        extraFields: [{ label: "Due Date", type: "date" }]
      },
      meeting: {
        title: "New Meeting",
        placeholder: "Meeting title",
        extraFields: [
          { label: "Meeting Date", type: "date" },
          { label: "Time", type: "time" }
        ]
      }
    };
    return configs[type] || { title: "", placeholder: "", extraFields: null };
  };

  if (!open || !type) return null;

  const config = getDialogConfig();


  // Apply formatting
const applyFormat = (command: string, value?: string ) => {
  document.execCommand(command, false, value);
};


  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.dialog} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.header}>
          <h2 style={styles.title}>{config.title}</h2>
          <button onClick={onClose} style={styles.closeButton} aria-label="Close">
            ✕
          </button>
        </div>
        
        {/* Content */}
        <div style={styles.content}>
          {/* Extra Fields (Email recipient, Phone, Date, etc.) */}
          {config.extraFields && (
            <div style={config.extraFields.length > 1 ? styles.flexRow : undefined}>
              {config.extraFields.map((field, index) => (
                <div key={index} style={styles.fieldGroup}>
                  <label style={styles.label}>{field.label}</label>
                  <input
                    type={field.type}
                    style={styles.input}
                    placeholder={field.label}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Title Input */}
          <div style={styles.fieldGroup}>
            <input
              type="text"
              placeholder={config.placeholder}
              style={styles.input}
            />
          </div>

          {/* Description Textarea */}
<div
  id="editor"
  contentEditable
  style={{
    minHeight: "130px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    padding: "10px",
    outline: "none",
    marginTop: "10px",
  }}
></div>

{/* Formatting Toolbar */}
<div style={styles.toolbar}>
  <button
    style={styles.toolButton}
    title="Bold"
    type="button"
    onClick={() => applyFormat("bold")}
  >
    <strong>B</strong>
  </button>

  <button
    style={styles.toolButton}
    title="Italic"
    type="button"
    onClick={() => applyFormat("italic")}
  >
    <em>I</em>
  </button>

  <button
    style={styles.toolButton}
    title="Underline"
    type="button"
    onClick={() => applyFormat("underline")}
  >
    <u>U</u>
  </button>

  <button
    style={styles.toolButton}
    title="Strikethrough"
    type="button"
    onClick={() => applyFormat("strikeThrough")}
  >
    <s>S</s>
  </button>

  <button
    style={styles.toolButton}
    title="Insert Link"
    type="button"
    onClick={() => {
      const url = prompt("Enter URL:");
      if (url) applyFormat("createLink", url);
    }}
  >
    🔗
  </button>
</div>


          {/* Footer Actions */}
          <div style={styles.footer}>
            <button style={styles.associatedButton} type="button">
              Associated Records
            </button>
            <button style={styles.addButton} type="button">
              Add {type}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: "fixed" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1300,
    padding: "20px",
    animation: "fadeIn 0.2s ease-in-out"
  },
  dialog: {
    backgroundColor: "white",
    borderRadius: "12px",
    width: "100%",
    maxWidth: "600px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
    maxHeight: "90vh",
    display: "flex",
    flexDirection: "column" as const,
    animation: "slideUp 0.3s ease-out"
  },
  header: {
    padding: "20px 24px",
    borderBottom: "1px solid #e0e0e0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fafafa"
  },
  title: {
    margin: 0,
    fontSize: "22px",
    fontWeight: "600" as const,
    color: "#1a1a1a"
  },
  closeButton: {
    background: "none",
    border: "none",
    fontSize: "24px",
    cursor: "pointer",
    color: "#666",
    padding: "4px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "4px",
    width: "32px",
    height: "32px",
    transition: "all 0.2s"
  },
  content: {
    padding: "24px",
    overflowY: "auto" as const,
    flex: 1
  },
  flexRow: {
    display: "flex",
    gap: "16px",
    marginBottom: "16px"
  },
  fieldGroup: {
    marginBottom: "16px",
    flex: 1
  },
  label: {
    display: "block",
    marginBottom: "8px",
    fontSize: "14px",
    fontWeight: "500" as const,
    color: "#333"
  },
  input: {
    width: "100%",
    padding: "12px",
    fontSize: "15px",
    border: "1px solid #d0d0d0",
    borderRadius: "6px",
    boxSizing: "border-box" as const,
    fontFamily: "inherit",
    transition: "border-color 0.2s",
    outline: "none"
  },
  textarea: {
    width: "100%",
    padding: "12px",
    fontSize: "15px",
    border: "1px solid #d0d0d0",
    borderRadius: "6px",
    boxSizing: "border-box" as const,
    fontFamily: "inherit",
    resize: "vertical" as const,
    minHeight: "100px",
    transition: "border-color 0.2s",
    outline: "none"
  },
  toolbar: {
    display: "flex",
    gap: "8px",
    marginBottom: "24px",
    paddingTop: "8px",
    flexWrap: "wrap" as const
  },
  toolButton: {
    padding: "8px 12px",
    fontSize: "14px",
    fontWeight: "500" as const,
    backgroundColor: "white",
    color: "#333",
    border: "1px solid #d0d0d0",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "all 0.2s",
    minWidth: "40px"
  },
  footer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: "16px",
    borderTop: "1px solid #e0e0e0",
    marginTop: "8px",
    gap: "12px",
    flexWrap: "wrap" as const
  },
  associatedButton: {
    padding: "10px 20px",
    fontSize: "15px",
    fontWeight: "500" as const,
    backgroundColor: "white",
    color: "#1976d2",
    border: "1px solid #1976d2",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "all 0.2s"
  },
  addButton: {
    padding: "10px 24px",
    fontSize: "15px",
    fontWeight: "500" as const,
    backgroundColor: "#1976d2",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "all 0.2s",
    textTransform: "capitalize" as const
  }
};

export default ActionDialog;