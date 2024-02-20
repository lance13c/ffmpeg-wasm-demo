interface Props {
  label: string;
  value: any;
  border?: boolean;
}

const LabelValue: React.FC<Props> = ({ label, value, border }) => {
  return (
    <dl className={`flex flex-col gap-0.5`}>
      <dt className="text-xs text-gray-600">{label}</dt>
      <dd>{value}</dd>
    </dl>
  );
};

export default LabelValue;
